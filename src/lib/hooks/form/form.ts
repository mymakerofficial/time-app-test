import { createFormHook } from '@tanstack/react-form'

import {
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '@/lib/components/FormComponents'
import { fieldContext, formContext } from '@/lib/hooks/form/formContext'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
