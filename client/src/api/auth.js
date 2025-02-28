import { request } from './util'
import { route } from 'preact-router'

export const setAuthToken = ({ authToken }) => {
  localStorage.token = authToken
  route('/profile')
}

export const login = async ({ teamToken, ionToken }) => {
  const resp = await request('POST', '/auth/login', {
    teamToken,
    ionToken
  })
  switch (resp.kind) {
    case 'goodLogin':
      return {
        authToken: resp.data.authToken
      }
    case 'badTokenVerification':
      return {
        teamToken: resp.message
      }
    case 'badUnknownUser':
      return {
        badUnknownUser: true
      }
    default:
      return {
        teamToken: 'Unknown response from server, please contact ctf administrator'
      }
  }
}

export const logout = () => {
  localStorage.removeItem('token')

  return route('/')
}

export const verify = async ({ verifyToken }) => {
  const resp = await request('POST', '/auth/verify', {
    verifyToken
  })
  switch (resp.kind) {
    case 'goodRegister':
    case 'goodVerify':
      return {
        authToken: resp.data.authToken
      }
    case 'goodEmailSet':
      return {
        emailSet: true
      }
    default:
      return {
        verifyToken: resp.message
      }
  }
}

export const register = async ({ email, name, ionToken, recaptchaCode }) => {
  const resp = await request('POST', '/auth/register', {
    email,
    name,
    ionToken,
    recaptchaCode
  })
  switch (resp.kind) {
    case 'goodRegister':
      localStorage.setItem('token', resp.data.authToken)

      return route('/profile')
    case 'goodVerifySent':
      return {
        verifySent: true
      }
    case 'badEmail':
    case 'badKnownEmail':
    case 'badCompetitionNotAllowed':
      return {
        errors: {
          email: resp.message
        }
      }
    case 'badKnownName':
      return {
        errors: {
          name: resp.message
        },
        data: resp.data
      }
    case 'badName':
      return {
        errors: {
          name: resp.message
        }
      }
  }
}

export const ionCallback = ({ ionCode }) => {
  return request('POST', '/integrations/ion/callback', {
    ionCode
  })
}

export const recover = async ({ email, recaptchaCode }) => {
  const resp = await request('POST', '/auth/recover', {
    email,
    recaptchaCode
  })
  switch (resp.kind) {
    case 'goodVerifySent':
      return {
        verifySent: true
      }
    default:
      return {
        errors: {
          email: resp.message
        }
      }
  }
}
