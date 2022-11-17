import React from 'react'
import { useEffect } from 'react'
import { custom_axios } from '../../api/client'

export const Root = () => {
  useEffect(() => {
    async function check_server_status() {
      try {
        await custom_axios({
          route : "/"
        })
      } catch (error) {
        console.log('error when trying to acceess "/" from server : ',error)
      }
    }
    check_server_status()
  },[])
  return (
    <div>Root</div>
  )
}
