import React from 'react'

const ObjectBox = ({ object,onClick=()=>{} }) => {
    if(!object) return null
  return (
      <div
          onClick={onClick}
          className='bg-blue-600 text-white px-2 rounded mx-4 cursor-pointer mt-2 '
      >{Object.keys(object).map((key, index) => <div key={index}><span>{key} : {object[key]}</span><br /></div>)}</div>
  )
}

export default ObjectBox