import * as icons from 'ionicons/icons'

export default function Icon({ name }) {
    const toCamelCase = (str) => {
        if (!str) return '';
        return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    }
    const iconKey = toCamelCase(name)
    const icon = icons[iconKey] || icons.helpCircleOutline
    return <ion-icon icon={icon}></ion-icon>
}

