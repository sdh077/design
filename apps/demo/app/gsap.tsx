import React from 'react'
import gsap from "gsap"

const Gsap = () => {
  gsap.to(".box", {
    x: 200,
    duration: 1
  })
  return (
    <div>Gsap</div>
  )
}

export default Gsap