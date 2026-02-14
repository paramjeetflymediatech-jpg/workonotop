// app/layout.js
import './globals.css'

export const metadata = {
  title: 'WorkOnTap',
  description: 'Admin dashboard for WorkOnTap',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}