import * as React from 'react'
import clsx from 'clsx'
import { useId } from '@reach/auto-id'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { validateRequired } from '~/utils/validators'

export type InputStatus = 'default' | 'error'

function Label({ className, ...labelProps }: JSX.IntrinsicElements['label']) {
  return <label {...labelProps} className={clsx('block text-sm font-medium text-gray-700', className)} />
}

type InputProps = (({ type: 'textarea' } & JSX.IntrinsicElements['textarea']) | JSX.IntrinsicElements['input']) & {
  status?: InputStatus
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const className = clsx(
    'mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed',
    props.className
  )

  if (props.type === 'textarea') {
    return <textarea {...(props as JSX.IntrinsicElements['textarea'])} className={className} />
  }

  return (
    <div className="mt-1 relative rounded-md shadow-sm">
      <input {...(props as JSX.IntrinsicElements['input'])} className={className} ref={ref} type="text" />
      {props.status === 'error' ? (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  )
})

interface InputErrorProps {
  id: string
  children?: string | null
}

function InputError({ children, id }: InputErrorProps) {
  if (!children) {
    return null
  }

  return (
    <p className="mt-2 text-sm text-red-600" id={id} role="alert">
      {children}
    </p>
  )
}

export const Field = React.forwardRef<
  HTMLInputElement,
  {
    defaultValue?: string | null
    name: string
    label: string
    className?: string
    required?: boolean
    readOnly?: boolean
    getFieldError?: (value: string) => string | null
    description?: React.ReactNode
  } & InputProps
>(function Field(
  { defaultValue, getFieldError, name, label, className, required, readOnly, description, id, ...props },
  ref
) {
  const prefix = useId()
  const inputId = id ?? `${prefix}-${name}`
  const errorId = `${inputId}-error`
  const descriptionId = `${inputId}-description`

  const [value, setValue] = React.useState(defaultValue ?? '')
  const [touched, setTouched] = React.useState(false)

  const errorMessage = (required ? validateRequired(label, value) : undefined) ?? getFieldError?.(value)

  const status = touched && errorMessage ? 'error' : 'default'

  return (
    <div className={className}>
      <div className="flex justify-between">
        <Label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </Label>
        {required || readOnly ? null : (
          <span className="text-sm text-gray-500" id="instagram-optional">
            Opsional
          </span>
        )}
      </div>
      <Input
        // @ts-expect-error no idea 🤷‍♂️
        ref={ref}
        {...(props as InputProps)}
        className={
          status === 'error'
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
            : undefined
        }
        name={name}
        id={inputId}
        autoComplete={name}
        required={required}
        aria-required={required ? 'true' : undefined}
        readOnly={readOnly}
        disabled={readOnly}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        onBlur={() => setTouched(true)}
        status={status}
        aria-describedby={errorMessage ? errorId : description ? descriptionId : undefined}
      />
      {status === 'error' ? <InputError id={errorId}>{errorMessage}</InputError> : null}
    </div>
  )
})
