import Image from "next/image"

export default function Logo() {
  return (
    <div>
      <Image src="https://garagehq.deuxfleurs.fr/images/garage-logo-horizontal.svg" alt="Logo" width={300} height={300} />
    </div>
  )
}