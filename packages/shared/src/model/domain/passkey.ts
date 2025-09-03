import z from 'zod'

export const AuthenticatorTransportFutureSchema = z.enum([
  'ble',
  'cable',
  'hybrid',
  'internal',
  'nfc',
  'smart-card',
  'usb',
])

const AuthenticatorAttachmentSchema = z.enum(['cross-platform', 'platform'])

const PublicKeyCredentialTypeSchema = z.enum(['public-key'])

export const PublicKeyCredentialCreationOptionsJSONSchema = z
  .object({
    rp: z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
    user: z.object({
      id: z.string(),
      name: z.string(),
      displayName: z.string(),
    }),
    challenge: z.base64url(),
    pubKeyCredParams: z
      .object({
        alg: z.number(),
        type: PublicKeyCredentialTypeSchema,
      })
      .array(),
    timeout: z.number().optional(),
    excludeCredentials: z
      .object({
        id: z.base64url(),
        type: PublicKeyCredentialTypeSchema,
        transports: AuthenticatorTransportFutureSchema.array().optional(),
      })
      .array()
      .optional(),
    authenticatorSelection: z
      .object({
        authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
        requireResidentKey: z.boolean().optional(),
        residentKey: z
          .enum(['discouraged', 'preferred', 'required'])
          .optional(),
        userVerification: z
          .enum(['discouraged', 'preferred', 'required'])
          .optional(),
      })
      .optional(),
    hints: z
      .enum(['hybrid', 'security-key', 'client-device'])
      .array()
      .optional(),
    attestation: z
      .enum(['direct', 'enterprise', 'indirect', 'none'])
      .optional(),
    attestationFormats: z
      .enum([
        'fido-u2f',
        'packed',
        'android-safetynet',
        'android-key',
        'tpm',
        'apple',
        'none',
      ])
      .array()
      .optional(),
    extensions: z
      .object({
        appid: z.string().optional(),
        credProps: z.boolean().optional(),
        hmacCreateSecret: z.boolean().optional(),
        minPinLength: z.boolean().optional(),
      })
      .optional(),
  })
  .meta({
    title: 'PublicKeyCredentialCreationOptionsJSON',
  })

const AuthenticatorAttestationResponseJSONSchema = z.object({
  clientDataJSON: z.base64url(),
  attestationObject: z.base64url(),
  authenticatorData: z.base64url().optional(),
  transports: AuthenticatorTransportFutureSchema.array().optional(),
  publicKeyAlgorithm: z.number().optional(),
  publicKey: z.base64url().optional(),
})

const CredentialPropertiesOutputSchema = z.object({
  rk: z.boolean().optional(),
})

const AuthenticationExtensionsClientOutputsSchema = z.object({
  appid: z.boolean().optional(),
  credProps: CredentialPropertiesOutputSchema,
  hmacCreateSecret: z.boolean().optional(),
})

export const RegistrationResponseJSONSchema = z
  .object({
    id: z.base64url(),
    rawId: z.base64url(),
    response: AuthenticatorAttestationResponseJSONSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    type: PublicKeyCredentialTypeSchema,
  })
  .meta({
    title: 'RegistrationResponseJSON',
  })
