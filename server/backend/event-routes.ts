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
import { first, last } from "lodash";
import { getLeadingCommentRanges } from "typescript";
import { format } from "path";
const router = express.Router();

// Routes
interface weeklyRetentionObject {
  registrationWeek:number;  //launch is week 0 and so on
  newUsers:number;  // how many new user have joined this week
  weeklyRetention:number[]; // for every week since, what percentage of the users came back. weeklyRetention[0] is always 100% because it's the week of registration  
  start:string;  //date string for the first day of the week
  end:string  //date string for the first day of the week
}


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
  const {dayZero} = req.query;
  const lastDay: number = new Date().setHours(23,59,59);
  let rawDataArray: {
    weekNumber: number;
    newUsers: string[];
    loggedOn: string[]
    startWeek: number;
    endWeek: number; 
  }[] = new Array(Math.ceil((lastDay - dayZero) / OneWeek))

  let currentWeek = dayZero;
  let currentEvents: Event[] = [];
  for (let i = 0; i < rawDataArray.length; i++){
    let newUsers: string[] = []
    let loggedUsers: string[] = []
    currentEvents = allEvents.filter((event: Event): Boolean =>{
      if (event.date > dayZero && event.date < lastDay){
        return (event.name == "signup" || event.name == "login")
        
      }
    return false;
    })

    currentEvents.forEach((event: Event) => {
      switch ()
    })
  }

  res.send('/retention')
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
