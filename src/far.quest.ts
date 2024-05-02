import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function fetchProfileByFid(fid: any) {
    if (!fid || fid === undefined) {
      return null;
    }

    interface User {
       result: { 
        user: {
        fid: string;
        followingCount: number;
        followerCount: number;
        pfp: {
          url: string;
          verified: boolean;
        };
        bio: {
          text: string;
          mentions: [];
        };
        external: boolean;
        custodyAddress: string;
        connectedAddress: string;
        allConnectedAddresses: {
          ethereum: [];
          solana: [];
        };
        username: string;
        displayName: string;
        registeredAt: number;
        }
      }
    }
    const options = {
        method: 'GET',
        url: 'https://build.far.quest/farcaster/v2/user',
        params: {fid: fid},
        headers: {accept: 'application/json', 'API-KEY': process.env.FARQUEST_API_KEY},
      };
      
    const response = await axios.request(options)
       .then((response: AxiosResponse<User>) => {
          return response.data.result.user;
        })
        .catch(function (error) {
          console.error(error);
        });

    return response;
}

export async function fetchProfileByUsername(username: any) {
  if (!username || username === undefined) {
    return null;
  }

  interface User {
    result: { 
     user: {
     fid: string;
     followingCount: number;
     followerCount: number;
     pfp: {
       url: string;
       verified: boolean;
     };
     bio: {
       text: string;
       mentions: [];
     };
     external: boolean;
     custodyAddress: string;
     connectedAddress: string;
     allConnectedAddresses: {
       ethereum: [];
       solana: [];
     };
     username: string;
     displayName: string;
     registeredAt: number;
     }
   }
 }

  const options = {
    method: 'GET',
    url: 'https://build.far.quest/farcaster/v2/user-by-username',
    params: {username: username},
    headers: {accept: 'application/json', 'API-KEY': process.env.FARQUEST_API_KEY},
  };
  
  const response = await axios
    .request(options)
   .then((response : AxiosResponse<User>) => {
      return response.data.result.user;
    })
    .catch(function (error) {
      console.error(error);
    });

  return response;
}

export async function fetchUserCastsByFid(fid: any) {
  if (!fid || fid === undefined) {
    return null;
  }

  const options = {
    method: 'GET',
    url: 'https://build.far.quest/farcaster/v2/casts',
    params: {fid: fid, limit: '100'},
    headers: {accept: 'application/json', 'API-KEY': process.env.FARQUEST_API_KEY},
  };
  
  const response = await axios
    .request(options)
   .then((response) => {
      return response.data.result.casts;
    })
    .catch(function (error) {
      console.error(error);
    });

  return response;
}

export async function getFidByUsername (username: string) {
  if (!username || username === undefined) {
    return null;
  }
  
  const user = await fetchProfileByUsername(username);
  return user?.fid;
}