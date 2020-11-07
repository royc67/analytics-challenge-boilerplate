///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
// some useful database functions in here:
import db, { formatDateToHour, formatDate, createEvent, createUser, getAllEvents } from "./database";
import { Event, weeklyRetentionObject } from "../../client/src/models/event";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { OneDay, OneWeek, OneHour } from './timeFrames'

import {
  shortIdValidation,
  searchValidation,
  userFieldsValidator,
  isUserValidator,
} from "./validators";
import { first, last, result } from "lodash";
import { getLeadingCommentRanges } from "typescript";
import { format } from "path";
import { User } from "../../client/src/models";
const router = express.Router();

//routes

interface Filter {
  sorting: string;
  type: string;
  browser: string;
  search: string;
  offset: number;
}

router.get('/all', (req: Request, res: Response) => {
  const allEvents: Event[] = getAllEvents()
  res.send(allEvents)  
});

router.get('/all-filtered', (req: Request, res: Response) => {
  const filters: Filter = req.query;
  let events: Event[] = getAllEvents()

  switch (filters.sorting) {
    case ("+date"): {
      events.sort((a,b)=> a.date - b.date)
      break;
    }
    case ("-date"): {
      events.sort((a,b)=> a.date - b.date).reverse();;
      break;
    }
    default: break;
  }
  
  if (filters.type) events = events.filter(event => event.name === filters.type)
  if (filters.browser) events = events.filter(event => event.browser === filters.browser)
  if (filters.search) events = events.filter(event => event.session_id.includes(filters.search))

  if (filters.offset) {
    
    events = events.slice(0, filters.offset)
  }
  
  
  res.send({events: events, more: (filters.offset) ? true : false})
});


router.get('/by-days/:offset', (req: Request, res: Response) => {
  const offset: number = parseInt(req.params.offset)
  const lastDay: number = new Date().setHours(0, 0, 0, 0) + OneDay - offset * OneDay;
  let firstDay: number = lastDay - OneWeek;
  
  let filteredEvents: Event[] = getAllEvents().filter((event): Boolean => {
    return (event.date > firstDay && event.date < lastDay)
  });
  let datesArr: string[] = new Array(7)
  let countsArr: number[] = [0,0,0,0,0,0,0]
  let sessionsByDays: {
    date: string, 
    count: number}[] = [];

  for (let i = 0; i < 7; i++) {
    datesArr[i] = formatDate(new Date(firstDay + OneDay * i));
  }

  for (let j = 0; j < filteredEvents.length; j++) {
    const index = datesArr.indexOf(formatDate(new Date(filteredEvents[j].date)));
    countsArr[index]++;
  }

  for (let k = 0; k < datesArr.length; k++) {
    sessionsByDays.push({
      date: datesArr[k],
      count: countsArr[k],
    });
  }
  
  res.json(sessionsByDays)
});

router.get('/by-hours/:offset', (req: Request, res: Response) => {
  const offset: number = parseInt(req.params.offset)
  const startDate: number = new Date().setHours(0,0,0) - offset * OneDay;
  
  let filteredEvents: Event[] = getAllEvents().filter((event): Boolean => {
    return (event.date > startDate && event.date < startDate + OneDay)
  });

  const counterArray: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  const hoursArray: string [] = new Array(24);
  let sessionsByHours: {
    hour: string, 
    count: number}[] = [];

  for (let i = 0; i < 24 ; i++){
    hoursArray[i] = formatDateToHour(new Date(startDate + OneHour * i));
  }
  console.log("counterArray", counterArray, "hoursArray", hoursArray);  
  for (let j = 0; j < filteredEvents.length; j++) {
    const currentHour = new Date(filteredEvents[j].date).setMinutes(0)
    const index = hoursArray.indexOf(formatDateToHour(new Date(currentHour)));
    counterArray[index]++;
  }

  for (let k = 0; k < hoursArray.length; k++) {
    sessionsByHours.push({
      hour: hoursArray[k],
      count: counterArray[k],
    });
  }
  console.log("sessionsByHours", sessionsByHours)

  res.json(sessionsByHours)
});

router.get('/today', (req: Request, res: Response) => {
  res.send('/today')
});

router.get('/week', (req: Request, res: Response) => {
  res.send('/week')
});

router.get('/retention', (req: Request, res: Response) => {
  const allEvents = getAllEvents();
  let results: weeklyRetentionObject[] = []
  let dayZero: number = +req.query.dayZero;
  dayZero = new Date (new Date(dayZero).toDateString()).getTime();
  const lastDay: number = new Date (new Date().toDateString()).getTime();
  const numberOfWeeks = Math.ceil((lastDay - dayZero) / OneWeek);
  console.log("numberOfWeeks", numberOfWeeks)

  let currentEvents: Event[] = [];
  let usersStats: {week: number; newUsers: string[]; loggedUsers: string[]}[] = []
  
  function getDateInFullFormat(dateNow:number): string{
    let year = new Date(dateNow).getFullYear()
    let day = new Date(dateNow).getDate()
    let month = new Date(dateNow).getMonth() +1;
    let hours = new Date(dateNow).getHours()
    let minutes = new Date(dateNow).getMinutes()
    return `${year}/${month}/${day}/${hours}/${minutes}`;
  }
  

  currentEvents = allEvents.filter((event: Event): Boolean =>{
    if (event.date > dayZero && event.date < lastDay + OneWeek){
      return (event.name === "signup" || event.name === "login")
      }
    return false;
    })
    let tempArr : {
      week: number; 
      newUsers: string[]; 
      loggedUsers: string[]
    }
    
    let weekStart = dayZero;
    let weekEnd = weekStart + OneWeek;
    
    for (let weekNumber = 1; weekNumber <= numberOfWeeks; weekStart+=OneWeek, weekEnd+=OneWeek, weekNumber++){
      if(new Date(weekStart).getHours() != 0){
        weekStart = new Date(weekStart + OneDay).setHours(0,0,0);
      }  
      if(new Date(weekEnd).getHours() != 0){
        weekEnd = new Date(weekEnd + OneDay).setHours(0,0,0);
      }  
      tempArr = {
        week: weekNumber,
        newUsers: [],
        loggedUsers: []
      };
      (weekNumber == 6) && console.log("weekStart", getDateInFullFormat(weekStart), "weekEnd" , getDateInFullFormat(weekEnd) + "==================");
      currentEvents.forEach((event: Event) => {
        if( weekEnd > event.date && event.date > weekStart ){
          switch (event.name){
            case ("signup"):
                tempArr.newUsers.push(event.distinct_user_id)
              break;
            case ("login"):
              if (!tempArr.loggedUsers.includes(event.distinct_user_id))
                tempArr.loggedUsers.push(event.distinct_user_id)
              break;
          }
        }
      })
      usersStats.push(tempArr);
      }

      console.log("usersStats", usersStats)

      let userCounter = 0;
      for (let i = 0; i<usersStats.length;i++){
        results.push({
          registrationWeek: i+1,
          newUsers: usersStats[i].newUsers.length,
          weeklyRetention: [100],
          start: getDateInFullFormat(dayZero + (i * OneWeek)),
          end: getDateInFullFormat(dayZero + (i+1) * OneWeek)
        })
        for (let k = i + 1 ; k<usersStats.length; k++){
          userCounter = usersStats[k].loggedUsers.filter((userId): Boolean => {
            return usersStats[i].newUsers.includes(userId)
          }).length
          // usersStats[i].newUsers.forEach((userId : string) => {
          //   if (usersStats[k].loggedUsers.includes(userId)){
          //     userCounter ++;
          //   }
          // })
          results[i].weeklyRetention.push(Math.round(100 * (userCounter / results[i].newUsers)))
        }
      }
      console.log("results:", results)

    
  

  res.send(results)
});

router.get('/:eventId',(req : Request, res : Response) => {
  res.send('/:eventId')
});


router.post('/', (req: Request, res: Response) => {
  createEvent(req.body)
  res.status(200).send()
});

router.get('/chart/os/:time',(req: Request, res: Response) => {
  res.send('/chart/os/:time')
})

  
router.get('/chart/pageview/:time',(req: Request, res: Response) => {
  res.send('/chart/pageview/:time')
})

router.get('/chart/timeonurl/:time',(req: Request, res: Response) => {
  res.send('/chart/timeonurl/:time')
})

router.get('/chart/geolocation/:time',(req: Request, res: Response) => {
  res.send('/chart/geolocation/:time')
})


export default router;
