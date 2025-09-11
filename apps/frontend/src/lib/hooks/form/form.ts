import { createFormHook } from '@tanstack/react-form'

import {
  FileField,
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '../../components/FormComponents.tsx'
import { fieldContext, formContext } from './formContext.ts'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    FileField,
    Select,
    TextArea,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
