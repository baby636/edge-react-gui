// @flow
import * as React from 'react'
import { Image, View } from 'react-native'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { connect } from 'react-redux'

import type { RootState } from '../../types/reduxTypes.js'
import { type ThemeProps, withTheme } from '../services/ThemeContext.js'

type OwnProps = {
  walletId: string,
  currencyCode: string,
  size?: number
}

type StateProps = {
  icon: string | void,
  progress: number
}

type Props = OwnProps & StateProps & ThemeProps

type State = {
  isDone: boolean
}

export class WalletProgressIconComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { isDone: false }
  }

  componentDidUpdate() {
    if (this.props.progress === 100) {
      setTimeout(() => {
        this.setState({ isDone: true })
      }, 500)
    }
    if (this.props.progress <= 5) {
      setTimeout(() => {
        this.setState({ isDone: false })
      }, 500)
    }
  }

  componentDidMount() {
    if (this.props.progress === 100) {
      this.setState({ isDone: true })
    }
  }

  render() {
    const { isDone } = this.state
    const { icon, progress, size, theme } = this.props
    const iconSize = {
      width: size || theme.rem(2),
      height: size || theme.rem(2)
    }

    let formattedProgress
    if (!icon) {
      formattedProgress = 0
    } else if (progress < 5) {
      formattedProgress = 5
    } else if (progress > 95 && progress < 100) {
      formattedProgress = 95
    } else {
      formattedProgress = progress
    }

    return (
      <AnimatedCircularProgress
        size={size ? size + theme.rem(0.25) : theme.rem(2.25)}
        width={theme.rem(3 / 16)}
        fill={formattedProgress}
        tintColor={isDone ? theme.walletProgressIconFillDone : theme.walletProgressIconFill}
        backgroundColor={theme.walletProgressIconBackground}
        rotation={0}
      >
        {() => (icon != null ? <Image style={iconSize} source={{ uri: icon }} /> : <View style={iconSize} />)}
      </AnimatedCircularProgress>
    )
  }
}

export const WalletProgressIcon = connect((state: RootState, ownProps: OwnProps): StateProps => {
  const { walletId, currencyCode } = ownProps
  let icon
  let progress = 100

  if (walletId) {
    const guiWallet = state.ui.wallets.byId[walletId]
    const walletsProgress = state.ui.wallets.walletLoadingProgress
    if (guiWallet.currencyCode === currencyCode) {
      icon = guiWallet.symbolImage
    } else {
      const meta = guiWallet.metaTokens.find(token => token.currencyCode === ownProps.currencyCode)
      icon = meta ? meta.symbolImage : undefined
    }
    progress = walletsProgress[walletId] ? walletsProgress[walletId] * 100 : 0
  }

  return {
    icon,
    progress
  }
})(withTheme(WalletProgressIconComponent))
