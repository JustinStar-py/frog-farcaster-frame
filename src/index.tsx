import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev';
import { createSystem } from 'frog/ui';
import { fetchProfileByFid, fetchUserCastsByFid } from './far.quest';
import userDataJson from './userData.json';
// import { neynar } from 'frog/hubs'

import qs from 'qs';
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
  const { buttonValue, inputText, frameData, status } = c

  ////////////////////////////////////////////////////
  ///////////////  Styling Variables ///////////////////

    const bgStyle = {
      position: 'absolute', 
      width: '100%', 
      height: '100%',
      border: '10px solid #A6EA35',
      borderRadius: '14px',
    }

    const titleTextStyle = {
      position: 'absolute', 
      top: '65%', 
      fontSize: 65, 
    }

    const subTitleTextStyle = {
      position: 'absolute', 
      top: '80%', 
      fontSize: 30, 
    }

    const profileStyle = {
      position: 'absolute', 
      width: '250px',
      height: '250px',
      top: '13%',
      left: '5%', 
      border: '15px solid #fff',
      borderRadius: '21px',
    }

    const usernameStyle = {
      position: 'absolute',
      top: '70%',
      left: '5%',
      fontSize: '33px',
    }

    const fidStyle = {
      position: 'absolute',
      top: '80%',
      left: '5%',
      fontSize: '25px',
  }

    const detailsTextStyle = {
      position: 'absolute',
      bottom: '2%',
      left: '3%',
      color: '#C848D5',
      fontStyle: 'italic',
      fontSize: '22px',
    }

    const tableStyle = {
      position: 'absolute', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px', 
      width: '95vw', 
      height: '90vh', 
      backgroundColor: '#1E293B', 
      borderRadius: '14px', 
      padding: '25px', 
      border: '25px solid #A6EA35'
    }

    const tableRowStyle = {
      fontSize: 38, 
      fontWeight: 'bolder', 
      color: '#3AB5F1', 
      borderRadius: '17px', 
      border: '5px solid #3AB5F1', 
      padding: '5px'
    }

    const tableRowStyleGolden = {
      fontSize: 42, 
      fontWeight: 'bolder', 
      color: 'gold', 
      borderRadius: '14px', 
      border: '6px solid #3AB5F1', 
      padding: '10px'
    }

    const tableRowDataStyle = {
      color: "#A6EA35",
      paddingLeft: '10px', 
      paddingRight: '5px'
    }

    //////////////////////////////////////////////
    //////////////  API Handling  ////////////////
    const handleZeroDataValue = async (data: any) => {
       if (data === 0 || data === null) {
           return '0'
       } else {
           return data
       }
    }

    const handleBigNumbers = async (data: any) => {
      // if is more than 1000 show 1k or 1m, show like +1.2k
      let num;
      if (data > 1000) {
        if (data > 1000000) {
          num = (data / 1000000).toFixed(1) + 'M';
        }
        num = (data / 1000) > 100 ? (data / 1000).toFixed(0) + 'k' : (data / 1000).toFixed(1) + 'k';
      } else {
        num = data
      }
      return num;
    }
    
    const farcasterID = buttonValue === "start" ? inputText : frameData?.fid
    const userData = await fetchProfileByFid(farcasterID)
    const userCasts = await fetchUserCastsByFid(farcasterID)
    
    let userCastsCount = 0;
    let userReplyCastsCount = 0;
    let userCastsReactionsCount = 0;
    let userCastsRepliesCount = 0;
    let userCastsRecastsCount = 0;
    let userAccountAge = 0;
    let userScore = 0;
    let userTier = 0;
    const tiers = [
      "New 👶",
      "Rookie👨",
      "Star ⭐️",
      "Pro ⚡️",
      "Diamond💎",
      "Master🧙🏻‍♀️",
      "Legend🧙🏻‍♂️",
      "Godlike👑",
    ];
    // const writing = await fs.writeFileSync('./userData.json', JSON.stringify(userCasts, null, 2))

   if (userCasts) {
      for (let i = 0; i < Object.keys(userCasts).length; i++) {
        if (Object.keys(userCasts[i]).length === 15) {
          userCastsCount += 1;
          userCastsReactionsCount += userCasts[i].reactions.count;
          userCastsRepliesCount += userCasts[i].replies.count;
          userCastsRecastsCount += userCasts[i].recasts.count;
        } else {
          userReplyCastsCount += 1
        }
     }
  }

  if (userData) {
    userScore = 
    Number(((userCastsReactionsCount * 1 
      + userCastsRepliesCount * 2 
      + userCastsRecastsCount * 3.5
      + userData.followerCount * 1.5 
      + userData.followingCount * 1
      + userCastsCount * 5)
    / 100).toFixed(2))

    // i wanna convert to days like 2 days , or 1 month and 30 days
    userAccountAge = Math.floor((Date.now() - new Date(userData.registeredAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  if (userData && userCasts) {
    if (userData?.followerCount > 0 && userData?.followerCount <= 100) {
      userTier = 0
   } else if (userData?.followerCount > 100 && userData?.followerCount <= 250) {
      userTier = 1
   } else if (userData?.followerCount > 250 && userData?.followerCount <= 500) {
      userTier = 2
   } else if (userData?.followerCount > 500 && userData?.followerCount <= 1250) {
      userTier = 3
   } else if (userData?.followerCount > 1250 && userData?.followerCount <= 2000) {
      userTier = 4
   } else if (userData?.followerCount > 2000 && userData?.followerCount <= 3500) {
      userTier = 5
   } else if (userData?.followerCount > 3500 && userData?.followerCount <= 7500) {
      userTier = 6
   } else if (userData?.followerCount > 7500) {
      userTier = 7
   } else {
      userTier = 0
   }
  }

  return c.res({
    image: (
      status === 'initial' ?
      <div style={{ color: 'white', display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E172A',  border: '40px solid #A6EA35',
      borderRadius: '25px' }}>
         <img width={250} src="https://jolly-diverse-herring.ngrok-free.app/logo/logo.png" style={{position: 'absolute', top: '17%', left: '40%'}} />
         <span style={titleTextStyle}>Farcaster User Analyzer ✨</span>
         <span style={subTitleTextStyle}>Frame by @justin-eth</span>
    </div> : 
    <div style={{ color: 'white',padding:'20px', display: 'flex', backgroundColor: '#0E172A', 
    height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={tableStyle}>
        <img width={100} src={userData?.pfp.url} style={profileStyle} />
        <span style={usernameStyle}>@{userData?.username}</span>
        <span style={fidStyle}>FID: {frameData?.fid}</span>
        <span style={detailsTextStyle}>**Snapshot will be update from 100 last casts</span>
        <div style={{ position: 'absolute', top: '7%', left: '30%', display: 'flex', flexDirection: 'column', gap: '10px', padding: '25px' }}>
           <span style={tableRowStyle}>
             Score :
             <span style={tableRowDataStyle}>{userScore}</span>
          </span>
           <span style={tableRowStyle}>
             Followers:
             <span style={tableRowDataStyle}>{handleBigNumbers(userData?.followerCount)}</span>
           </span>
           <span style={tableRowStyle}>
              Followings: 
            <span style={tableRowDataStyle}>{handleBigNumbers(userData?.followingCount)}</span>
           </span>
           <span style={tableRowStyle}>
              Qoute casts:
              <span style={tableRowDataStyle}>{handleZeroDataValue(userCastsCount)}</span>
            </span>
           <span style={tableRowStyle}>
              Reply casts:
             <span style={tableRowDataStyle}>{handleZeroDataValue(userReplyCastsCount)}</span>
            </span>
        </div>
        <div style={{ position: 'absolute', top: '7%', left: '61%', display: 'flex', flexDirection: 'column', gap: '10px', padding: '25px' }}>
            <span style={tableRowStyle}>
                Active tier :
               <span style={tableRowDataStyle}>{tiers[userTier]}</span>
            </span>
            <span style={tableRowStyle}>
                Account age:
               <span style={tableRowDataStyle}>{userAccountAge} d</span>
            </span>
           <span style={tableRowStyle}>
              Reactions:
              <span style={tableRowDataStyle}>{handleZeroDataValue(userCastsReactionsCount)}</span>
           </span>
           <span style={tableRowStyle}>
              Replies: 
            <span style={tableRowDataStyle}>{handleZeroDataValue(userCastsRepliesCount)}</span>
           </span>
           <span style={tableRowStyle}>
              Recasts:
              <span style={tableRowDataStyle}>{handleZeroDataValue(userCastsRecastsCount)}</span>
            </span>
        </div>
      </div>
    </div>     
    ),
    imageAspectRatio: '1.91:1',
    imageOptions: {
      emoji: "twemoji",
    },
    intents: [
    <Button value="my-state">My State</Button>,
    <Button value="start">Start</Button>,
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
