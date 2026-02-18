declare global {
  namespace App {
    interface Locals {
      user: {
        authenticated: boolean
        isAdmin: boolean
        token?: string
      }
    }
  }
}
export {}
