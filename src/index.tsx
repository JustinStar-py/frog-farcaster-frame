import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev';
// import { neynar } from 'frog/hubs'

import * as qs from 'qs';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';


dotenv.config();
export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})


app.use('/*', serveStatic({ root: './public' }))

// degen chart frame
app.frame('/degen-chart', (c) => {
  const { buttonValue, inputText, status } = c
  const action = status === 'initial' ? process.env.STATIC_NODE_URL + '/degen-chart' : process.env.STATIC_NODE_URL + '/degen-chart-show'
  const image = status === 'initial' ? `${process.env.STATIC_NODE_URL}/gifs/degen-chart.gif` : `${process.env.STATIC_NODE_URL}/gifs/chart-timeframe.gif`
  const frameSharingText = "https://warpcast.com/~/compose?text=Check $DEGEN chart easily here! ✨" + encodeURIComponent("\n") + "frame by @justin-eth 🤝🏻&embeds[]=https://jolly-diverse-herring.ngrok-free.app/degen-chart"
  const intervalTimesButtons = ["15m", "1h", "4h", "1d"]
 
  const buttons = status === 'initial' ? [
      <Button value="show-chart">$DEGEN Chart</Button>,
      <Button.Link href={frameSharingText}>Share Frame</Button.Link>
  ] : [
      <Button value={intervalTimesButtons[0]}>{intervalTimesButtons[0]}</Button>,
      <Button value={intervalTimesButtons[1]}>{intervalTimesButtons[1]}</Button>,
      <Button value={intervalTimesButtons[2]}>{intervalTimesButtons[2]}</Button>,
      <Button value={intervalTimesButtons[3]}>{intervalTimesButtons[3]}</Button>,
  ]

  return c.res({
    action,
    image,
    intents: buttons,
  })
})

app.frame('/degen-chart-show', async (c) => {
  const { buttonValue, status } = c
  const intervalTimesButtons = ["15m", "1h", "4h", "1d"]
  
  const fetchImage = async () => {
    const img = await axios.get('https://api.chart-img.com/v1/tradingview/advanced-chart/storage', {
        headers: {
          Authorization: 'Bearer ' + process.env.CHART_IMG_KEY,
        },
        params: {
          symbol: 'BYBIT:DEGENUSDT',
          interval: buttonValue,
          studies: [],
        },
        paramsSerializer: (params: any) => {
          return qs.stringify(params, { arrayFormat: 'repeat' })
        },
      })
      .then((res: any) => {
        return res.data.url
      }).catch((err: any) => {
        console.error(err)
      })

    return img;
  }

  return c.res({
    image: await fetchImage(),
    intents: [
      <Button value={intervalTimesButtons[0]}>{intervalTimesButtons[0]}</Button>,
      <Button value={intervalTimesButtons[1]}>{intervalTimesButtons[1]}</Button>,
      <Button value={intervalTimesButtons[2]}>{intervalTimesButtons[2]}</Button>,
      <Button value={intervalTimesButtons[3]}>{intervalTimesButtons[3]}</Button>
    ]
  })
})

const port = 3000
console.log(`Server is running on port ${port}`)

devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port,
})
