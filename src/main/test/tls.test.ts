import * as fs from 'fs'
import * as path from 'path'
import {fold, Option} from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import * as _ from 'lodash/fp'
import {chain} from 'fp-ts/lib/Array'
import {toArray} from 'fp-ts/lib/Record'
import * as forge from 'node-forge'
import * as tls from '../tls'
import {TLSCertificateData, TLSData} from '../tls'
import * as params from './data/params.json'

const unsafeGet = <A>(maybeValue: Option<A>): A =>
  fold<A, A>(
    () => {
      throw Error('Could not get a value from `None`')
    },
    (x) => x,
  )(maybeValue)

describe('TLS', () => {
  const keyStorePath = path.resolve(__dirname, './data/midnightCA.p12')
  const passwordPath = path.resolve(__dirname, './data/password')
  const pkcsRawData = fs.readFileSync(path.resolve(__dirname, './data/midnightCA.p12'))
  const pemRawData = fs.readFileSync(path.resolve(__dirname, './data/midnightCA.pem'), {
    encoding: 'utf8',
  })
  const normalizedFingerprint = pipe(
    params.fingerprint,
    _.replace(/:/g, ''),
    _.toLower,
    forge.util.hexToBytes,
    forge.util.encode64,
    (base64) => `sha256/${base64}`,
  )

  it('should extract data matching params used to create and derived from created certificate', () => {
    const actual: TLSCertificateData = pipe(
      pkcsRawData,
      tls.extractCertData(params.password),
      unsafeGet,
    )

    expect(actual.fingerprint).toEqual(normalizedFingerprint)
    expect(actual.serialNumber.toLowerCase()).toEqual(params.serialNumber.toLowerCase())
  })

  describe('certificate validation', () => {
    const tlsConfig: TLSData = {
      keyStorePath,
      passwordPath,
      certData: {
        serialNumber: params.serialNumber,
        fingerprint: normalizedFingerprint,
        issuer: params.issuer,
      },
    }
    const expectedUrl = `https://${params.domain}:1234`
    const verifier = tls.verifyCertificate(tlsConfig, expectedUrl)
    const validCertificate: Readonly<Electron.Certificate> = {
      data: pemRawData,
      fingerprint: normalizedFingerprint,
      issuer: {
        commonName: params.issuer,
        country: '',
        locality: '',
        organizations: [],
        organizationUnits: [],
        state: '',
      },
      issuerCert: {} as Electron.Certificate,
      issuerName: params.issuer,
      serialNumber: params.serialNumber,
      validExpiry: 0,
      validStart: 0,
      subject: {
        commonName: params.issuer,
        country: '',
        locality: '',
        organizations: [],
        organizationUnits: [],
        state: '',
      },
      subjectName: params.issuer,
    }

    //The value is a tuple of: [wrong value, url to pass, certificate to pass]
    const invalidParams: Record<string, Array<[string, string, Electron.Certificate]>> = {
      url: [
        `http://${params.domain}:1234`,
        `https://foo:1234`,
        `https://${params.domain}:12`,
      ].map((url) => [url, url, validCertificate]),
      issuer: ((): Array<[string, string, Electron.Certificate]> => {
        const invalidIssuer = 'foo'
        return [[invalidIssuer, expectedUrl, _.set('subjectName', invalidIssuer, validCertificate)]]
      })(),
      fingerprint: [
        params.fingerprint,
        normalizedFingerprint.replace('sha256', ''),
        `sha256/${params.fingerprint}`,
        `sha256/${normalizedFingerprint.replace('a', 'b')}`,
      ].map((fingerprint) => [
        fingerprint,
        expectedUrl,
        _.set('fingerprint', fingerprint, validCertificate),
      ]),
    }

    it('should pass if all params match', () => {
      const actual = verifier(expectedUrl, validCertificate)

      expect(actual).toEqual(true)
    })

    pipe(
      invalidParams,
      toArray,
      chain(([paramName, values]) =>
        values.map(([invalidValue, url, cert]) => ({paramName, invalidValue, url, cert})),
      ),
    ).forEach(({paramName, invalidValue, url, cert}) => {
      it(`should fail if ${paramName} has invalid value: ${invalidValue}`, () => {
        const actual = verifier(url, cert)

        expect(actual).toBe(false)
      })
    })
  })
})
