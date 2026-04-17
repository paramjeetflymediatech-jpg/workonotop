import * as icons from 'ionicons/icons'


const toCamelCase = (str) =>
    str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

export default function Icon({ name }) {
    const iconKey = toCamelCase(name)
    const icon = icons[iconKey] || icons.helpCircleOutline
    return <ion-icon icon={icon}></ion-icon>
}

