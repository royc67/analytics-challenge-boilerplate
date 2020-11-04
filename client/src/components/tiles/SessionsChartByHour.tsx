import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "10px",
    marginBottom: "5px",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: "10px",
    width: "40%",
  },
  chart: {
    maxHeight: "100%",
    paddingBottom: "10px",
  },
  head: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
}));

export interface HourSessions {
  hour: string;
  count: number;
  offset?: number;
}

const SessionsByHourChart: React.FC = () => {
  const [sessionsCount, setSessionsCount] = useState<HourSessions[]>([]);
  const [mainGraph, setMainGraph] = useState<number>(getDaysOffset(getCurrentDate()));
  const [secondaryGraph, setSecondaryGraph] = useState<number>(getDaysOffset(getYesterdayDate()));

  const classes = useStyles();

  useEffect(() => {
    async function fetch() {
      const { data: today } = await axios.get(
        `http://localhost:3001/events/by-hours/${mainGraph}`
      );
      const { data: yesterday } = await axios.get(
        `http://localhost:3001/events/by-hours/${secondaryGraph}`
      );

      console.log(yesterday);
      console.log(today);
      const combined: HourSessions[] = today.map((day: HourSessions, index: number) => ({
        offset: yesterday[index].count,
        count: day.count,
        hour: day.hour,
      }));
      setSessionsCount(combined);
    }

    fetch();
  }, [mainGraph, secondaryGraph]);

  function getDaysOffset(date: string): number {
    const dayInMili = 1000 * 60 * 60 * 24;
    let offset: number = 0;
    const offsetInDate = new Date(date);
    const now = new Date(new Date(Date.now()).toDateString()).getTime();

    offset = (now - offsetInDate.getTime()) / dayInMili;
    return Math.ceil(offset);
  }
  const updateMain = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMainGraph(getDaysOffset(event.target.value));
  };

  const updateSecondary = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSecondaryGraph(getDaysOffset(event.target.value));
  };

  function getCurrentDate(): string {
    const now: string = new Date().toJSON();
    return now.slice(0, 10);
  }

  function getYesterdayDate(): string {
    const day = 1000 * 60 * 60 * 24;
    const now: string = new Date(Date.now() - day).toJSON();
    return now.slice(0, 10);
  }

  return (
    <>
      <div className={classes.chart}>
        <div className={classes.container}>
          <h2 className={classes.head}>Sessions (Hours):</h2>
          <form className={classes.container} noValidate>
            <TextField
              id="datetime-local"
              label="Main"
              type="date"
              defaultValue={getCurrentDate()}
              onChange={updateMain}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="datetime-local"
              label="Secondary"
              type="date"
              defaultValue={getYesterdayDate()}
              onChange={updateSecondary}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </form>
        </div>
        <ResponsiveContainer width="90%" height="80%">
          <LineChart data={sessionsCount} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="count" stroke="#8884d8" name="Main" />
            <Line type="monotone" dataKey="offset" stroke="#8c0819" name="Secondary" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SessionsByHourChart;
