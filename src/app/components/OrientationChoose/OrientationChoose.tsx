import {Navigate} from 'react-router-dom'

type OrientationChooseProps = {
  title: string
  targetPath: string
  backPath: string
}

// 縦画面の選択肢を廃止し、常に横画面で直接遷移する
const OrientationChoose = ({targetPath}: OrientationChooseProps) => (
  <Navigate to={targetPath} state={{orientation: 'landscape'}} replace />
)

export {OrientationChoose}
