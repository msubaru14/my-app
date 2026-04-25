import "./AuthCard.css"

type Props = {
  title: string
  children: React.ReactNode
  footer: React.ReactNode
}

export const AuthCard = ({ title, children, footer }: Props) => {
  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">{title}</h1>

          <div className="auth-body">
            {children}
          </div>

          <div className="auth-footer">
            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}
