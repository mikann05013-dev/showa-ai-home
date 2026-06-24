import type { AvatarId } from '../types'

export function AvatarView({
  avatarId,
  customImage,
  className = '',
}: {
  avatarId: AvatarId
  customImage: string
  className?: string
}) {
  return (
    <span className={`os-avatar avatar-${avatarId} ${customImage ? 'custom' : ''} ${className}`}>
      {customImage ? <img src={customImage} alt="" draggable="false" /> : null}
    </span>
  )
}
