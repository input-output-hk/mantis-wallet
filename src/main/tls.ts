import {promises as fs} from 'fs'
import * as path from 'path'
import * as childProcess from 'child_process'
import {promisify} from 'util'
import * as os from 'os'
import {URL} from 'url'
import {generate as generatePassword} from 'generate-password'
import {ElectronLog} from 'electron-log'
import {pipe} from 'fp-ts/lib/pipeable'
import * as forge from 'node-forge'
import {array, option} from 'fp-ts'
import * as T from 'io-ts'
import {Option} from 'fp-ts/lib/Option'
import {processEnv, processExecutablePath} from './MantisProcess'
import {prop, through} from '../shared/utils'
import {ClientSettings, MantisConfig} from '../config/type'
import {createTErrorMain} from './i18n'
import {OptionOps} from '../shared'

const keyStoreFilename = 'mantisCA.p12'
const passwordFilename = 'password'

export const tlsConfig = T.type({
  keyStorePath: T.string,
  passwordPath: T.string,
})

export type TLSConfig = T.TypeOf<typeof tlsConfig>

export interface TLSCertificateData {
  fingerprint: string
  issuer: string
  serialNumber: string
}

export type TLSData = TLSConfig & {
  certData: TLSCertificateData
}

export const httpRpcOverTLS = {
  'mantis.network.rpc.http.mode': 'https',
}

export const configToParams = (config: TLSConfig): ClientSettings => {
  const keystoreParams = pipe(
    {
      'certificate.keystore-path': config.keyStorePath,
      'certificate.password-file': config.passwordPath,
      'certificate.keystore-type': 'PKCS12',
    },
    Object.entries,
    array.map(([key, value]) => [`mantis.network.rpc.http.${key}`, value]),
    Object.fromEntries,
  )

  return {...keystoreParams, ...httpRpcOverTLS}
}

const calculateFingerprint = (cert: forge.pki.Certificate): Option<string> => {
  const pemToDer = (pem: string): Option<forge.util.ByteStringBuffer> =>
    pipe(
      pem,
      forge.pem.decode,
      array.head,
      option.map(through(prop('body'), forge.util.createBuffer)),
    )

  const sha256 = (der: forge.util.ByteStringBuffer): forge.util.ByteStringBuffer =>
    forge.md.sha256
      .create()
      .update(der.getBytes(), 'raw')
      .digest()

  return pipe(
    cert,
    forge.pki.certificateToPem,
    pemToDer,
    option.map(
      through(
        sha256,
        (hash) => forge.util.encode64(hash.getBytes()),
        (base64) => `sha256/${base64}`,
      ),
    ),
  )
}

export const verifyCertificate = (tlsData: TLSData, expectedUrl: URL) => (
  requestUrl: URL,
  certificate: Electron.Certificate,
): boolean => {
  const forgeCert = forge.pki.certificateFromPem(certificate.data)

  const urlMatch = requestUrl.href === expectedUrl.href
  const issuerMatch = certificate.subjectName === tlsData.certData.issuer
  const serialNumberMatch =
    forgeCert.serialNumber.toLowerCase() === tlsData.certData.serialNumber.toLowerCase()
  const fingerprintMatch = certificate.fingerprint === tlsData.certData.fingerprint

  return urlMatch && issuerMatch && serialNumberMatch && fingerprintMatch
}

export const extractCertData = (password: string) => (
  rawPKCS12: Buffer,
): Option<TLSCertificateData> => {
  const certBagType = forge.pki.oids.certBag

  return pipe(
    rawPKCS12,
    (buffer) => forge.util.createBuffer(buffer.toString('binary')),
    forge.asn1.fromDer,
    (asn1) => forge.pkcs12.pkcs12FromAsn1(asn1, password.trim()),
    (pkcs) => pkcs.getBags({bagType: certBagType})[certBagType]?.[0]?.cert,
    option.fromNullable,
    option.chain((cert) => {
      const maybeFingerprint = calculateFingerprint(cert)
      const maybeIssuer: Option<string> = option.fromNullable(cert.issuer.getField('CN')?.value)

      return pipe(
        OptionOps.zip(maybeFingerprint)(maybeIssuer),
        option.map(([fingerprint, issuer]) => ({
          serialNumber: cert.serialNumber.toLowerCase(),
          fingerprint,
          issuer,
        })),
      )
    }),
  )
}

/**
 * Set ups TLS keys for use with node
 * @param nodeConfig Configuration of node needed to run keytool
 */
export async function setupOwnTLS(nodeConfig: MantisConfig): Promise<TLSData> {
  const password = generatePassword({length: 16})
  const issuer = `mantis-wallet-${generatePassword({length: 16})}`
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mantis-wallet'))
  const keyStorePath = path.resolve(tempDir, keyStoreFilename)
  const passwordPath = path.resolve(tempDir, passwordFilename)
  const keytoolOptions = [
    `-genkeypair`,
    `-keystore "${keyStorePath}"`,
    `-storetype PKCS12`,
    `-dname "CN=${issuer}"`,
    `-ext "san=ip:127.0.0.1,dns:localhost"`,
    `-keypass ${password}`,
    `-storepass ${password}`,
    `-keyalg RSA`,
    `-keysize 4096`,
    `-validity 9999`,
  ]
  await promisify(childProcess.exec)(
    `${processExecutablePath(nodeConfig)} keytool ${keytoolOptions.join(' ')}`,
    {env: processEnv(nodeConfig)},
  )
  await fs.writeFile(passwordPath, password)

  const config: TLSConfig = {keyStorePath, passwordPath}

  return setupExternalTLS(config)
}

/**
 * Sets up TLS given at specific paths
 * @param tlsConfig
 */
export async function setupExternalTLS(tlsConfig: TLSConfig): Promise<TLSData> {
  const password = await fs.readFile(tlsConfig.passwordPath, {encoding: 'utf8'})
  const rawPkcs12 = await fs.readFile(tlsConfig.keyStorePath)

  return pipe(
    rawPkcs12,
    extractCertData(password),
    option.fold(
      () => {
        throw createTErrorMain(['error', 'couldNotExtractCertificateData'])
      },
      (certData) => ({...tlsConfig, certData}),
    ),
  )
}

export function registerCertificateValidationHandler(
  app: Electron.App,
  tlsData: TLSData,
  expectedUrl: URL,
  mainLog: ElectronLog,
): void {
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    const isCertValid = verifyCertificate(tlsData, expectedUrl)(new URL(url), certificate)
    if (isCertValid) {
      mainLog.info('Self-signed cert verification passed. Accepting')
      event.preventDefault()
      callback(true)
    } else {
      mainLog.info('Rejecting unknown certificate')
      callback(false)
    }
  })
}
