import "./FormField.css"

type Props = {
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FormField = ({
  label,
  type = "text",
  value,
  onChange
}: Props) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
