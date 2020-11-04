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

export interface DaySessions {
  date: string;
  count: number;
  offset?: number;
}

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
    width: "100%",
  },
  chart: {
    maxHeight: "100%",
    paddingBottom: "10px",
  },
  head: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

const SessionsByDayChart: React.FC = () => {
  const [sessionsCount, setSessionsCount] = useState<DaySessions[]>([]);
  const [mainGraph, setMainGraph] = useState<number>(0);

  const classes = useStyles();

  useEffect(() => {
    async function fetch() {
      const { data: thisWeek } = await axios.get(
        `http://localhost:3001/events/by-days/${mainGraph}`
      );
      setSessionsCount(thisWeek);
    }

    fetch();
  }, [mainGraph]);

  function getDaysOffset(date: string): number {
    const dayInMili = 1000 * 60 * 60 * 24;
    let offset: number = 0;
    const offsetInDate = new Date(date);
    const now = new Date(new Date(Date.now()).toDateString()).getTime();

    offset = (now - offsetInDate.getTime()) / dayInMili;
    return Math.floor(offset);
  }

  const updateMain = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMainGraph(Math.floor(getDaysOffset(event.target.value)));
  };

  function getCurrentDate(): string {
    const now: string = new Date().toJSON();
    return now.slice(0, 10);
  }

  return (
    <>
      <div className={classes.chart}>
        <div className={classes.container}>
          <h2 className={classes.head}>Sessions (Days):</h2>
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
          </form>
        </div>
        <ResponsiveContainer width="90%" height="80%">
          <LineChart data={sessionsCount} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="count" stroke="#8884d8" name="This Week" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SessionsByDayChart;
