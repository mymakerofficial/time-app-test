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

const UserVerificationRequirementSchema = z.enum([
  'discouraged',
  'preferred',
  'required',
])

const PublicKeyCredentialHintSchema = z.enum([
  'hybrid',
  'security-key',
  'client-device',
])

const AuthenticationExtensionsClientInputsSchema = z.object({
  appid: z.string().optional(),
  credProps: z.boolean().optional(),
  hmacCreateSecret: z.boolean().optional(),
  minPinLength: z.boolean().optional(),
})

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
        residentKey: UserVerificationRequirementSchema.optional(),
        userVerification: UserVerificationRequirementSchema.optional(),
      })
      .optional(),
    hints: PublicKeyCredentialHintSchema.array().optional(),
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
    extensions: AuthenticationExtensionsClientInputsSchema.optional(),
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
  credProps: CredentialPropertiesOutputSchema.optional(),
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

const PublicKeyCredentialDescriptorJSONSchema = z.object({
  id: z.base64url(),
  type: PublicKeyCredentialTypeSchema,
  transports: AuthenticatorTransportFutureSchema.array().optional(),
})

export const PublicKeyCredentialRequestOptionsJSONSchema = z
  .object({
    challenge: z.base64url(),
    timeout: z.number().optional(),
    rpId: z.string().optional(),
    allowCredentials:
      PublicKeyCredentialDescriptorJSONSchema.array().optional(),
    userVerification: UserVerificationRequirementSchema.optional(),
    hints: PublicKeyCredentialHintSchema.array().optional(),
    extensions: AuthenticationExtensionsClientInputsSchema.optional(),
  })
  .meta({
    title: 'PublicKeyCredentialRequestOptionsJSON',
  })

const AuthenticatorAssertionResponseJSONSchema = z.object({
  clientDataJSON: z.base64url(),
  authenticatorData: z.base64url(),
  signature: z.base64url(),
  userHandle: z.base64url().optional(),
})

export const AuthenticationResponseJSONSchema = z
  .object({
    id: z.base64url(),
    rawId: z.base64url(),
    response: AuthenticatorAssertionResponseJSONSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    type: PublicKeyCredentialTypeSchema,
  })
  .meta({
    title: 'AuthenticationResponseJSON',
  })
