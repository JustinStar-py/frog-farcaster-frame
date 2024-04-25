import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev';
import { createSystem } from 'frog/ui';
import { DuneClient } from "@duneanalytics/client-sdk";
// import { neynar } from 'frog/hubs'

import * as qs from 'qs';
import axios from 'axios';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';


dotenv.config();
export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})


app.use('/*', serveStatic({ root: './public' }))

/**
* Degen Chart routing 
* @route /degen-chart
* @route /degen-chart-show
*/
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


/**
 * Farcaster analytics
 * @route /farcaster-user-analytics
 */
app.frame('/farcaster-user-analytics', async (c) => {
  const { buttonValue, inputText, status, frameData } = c

  const bgStyle = {
    position: 'absolute', 
    width: '100%', 
    height: '100%',
  }

  const titleTextStyle = {
    position: 'absolute', 
    top: '70%', 
    fontSize: 65, 
  }

  const subTitleTextStyle = {
    position: 'absolute', 
    top: '88%', 
    fontSize: 30, 
  }

  const profileStyle = {
    position: 'absolute', 
    width: '250px',
    height: '250px',
    top: '15%',
    left: '10%', 
    border: '10px solid #A6EA35',
    borderRadius: '14px',
  }

  const usernameStyle = {
     position: 'absolute',
     top: '70%',
     left: '10%',
     fontSize: '35px',
  }

  const fidStyle = {
    position: 'absolute',
    top: '80%',
    left: '10%',
    fontSize: '25px',
 }

  return c.res({
    image: (
      buttonValue !== 'my-state' ? 
      <div style={{ color: 'white', display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
         <img width={300} src="https://pbs.twimg.com/card_img/1780661788171759616/CLT7OKIf?format=png&name=large" style={bgStyle} />
         <span style={titleTextStyle}>Farcaster User Analyzer</span>
         <span style={subTitleTextStyle}>Frame by @justin-eth</span>
    </div> : 
    <div style={{ color: 'white',padding:'20px', display: 'flex', backgroundColor: '#0E172A', 
    height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: '10px', width: '95vw', height: '90vh', backgroundColor: '#1E293B', borderRadius: '14px', padding: '25px', border: '25px solid #A6EA35'}}>
        <img width={100} src="https://i.imgur.com/qfbNFFj.jpg" style={profileStyle} />
        <span style={usernameStyle}>@JustinStar</span>
        <span style={fidStyle}>FID: {frameData?.fid}</span>
        <div style={{ position: 'absolute', top: '30%', left: '40%', display: 'flex', flexDirection: 'column', gap: '10px', padding: '25px' }}>
           <span style={{ fontSize: 40, fontWeight: 'bolder', color: '#3AB5F1' }}>Score:</span>
           <span style={{ fontSize: 40, fontWeight: 'bolder', color: '#3AB5F1' }}>Reactions:</span>
           <span style={{ fontSize: 40, fontWeight: 'bolder', color: '#3AB5F1' }}>Comments:</span>
           <span style={{ fontSize: 40, fontWeight: 'bolder', color: '#3AB5F1' }}>Comments:</span>
           <span style={{ fontSize: 40, fontWeight: 'bolder', color: '#A6EA35' }}>Comments:</span>
        </div>
      </div>
    </div>     
    ),
    imageAspectRatio: '1.91:1',
    intents: [
    <Button value="my-state">My State</Button>,
    <Button value="share-frame">Share Frame</Button>,
    <TextInput placeholder="farcaster username" />],
  },
)
})




const port = 3000
console.log(`Server is running on port ${port}`)

devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port,
})
