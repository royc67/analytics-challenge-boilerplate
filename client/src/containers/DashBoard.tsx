import React from "react";
import GeoTile from "../components/tiles/GeoTile2";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import { TimeOnURLChartBar, TimeOnURLChartPie } from "../components/tiles/TimeOnURLChart";
import ErrorBoundary from "../components/ErrorBoundary";
import SessionsByDayChart from "../components/tiles/SessionsChartByDay";
import EventLog from "../components/tiles/EventsLog";
import SessionsByHourChsrt from "../components/tiles/SessionsChartByHour";
import RetentionCohort from "../components/tiles/RetentionCohort";

const useStyles = makeStyles((theme) => ({
  dashboard: {
    flexGrow: 1,
    gap: "50px",
    marginTop: "20px",
    maxWidth: "300vw",
    marginLeft: "auto",
    marginRight: "auto",
  },
  tile: {
    display: "flex",
    flexDirection: "column",
    boxShadow: "0.5px 0px 0.5px 2px black",
    height: "50vh",
    width: "80vh",
    minWidth: "300px",
    minHeight: "250px",
    padding: "0px",
    alignContent: "center",
  },
  GeoTile: {
    display: "flex",
    boxShadow: "0.5px 0px 0.5px 2px black",
    height: "70vh",
    width: "100vh",
    minWidth: "70vw",
    minHeight: "250px",
    padding: "0px",
  },
  "MuiGrid-item": {
    padding: "10px",
  },
}));

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <ErrorBoundary>
        <Grid container justify={"center"} spacing={10} className={classes.dashboard}>
          <ErrorBoundary>
              <Grid item className={classes.GeoTile} xs={10}>
                  <GeoTile />
              </Grid>
          </ErrorBoundary>
          <ErrorBoundary>
              <Grid item className={classes.tile} xs={5}>
                <SessionsByDayChart />
              </Grid>
          </ErrorBoundary>
          <ErrorBoundary>
            <Grid item className={classes.tile} xs={6}>
              <SessionsByHourChsrt />
            </Grid>
          </ErrorBoundary>
          <ErrorBoundary>
            <Grid item className={classes.tile} xs={5}>
              <TimeOnURLChartPie />
            </Grid>
          </ErrorBoundary>
          <ErrorBoundary>
            <Grid item className={classes.tile} xs={6}>
              <TimeOnURLChartBar />
            </Grid>
          </ErrorBoundary>
          <ErrorBoundary>
            <Grid item className={classes.tile} xs={7}>
              <EventLog />
            </Grid>
          </ErrorBoundary>
          <ErrorBoundary>
            <Grid item className={classes.GeoTile} xs={7}>
              <RetentionCohort />
            </Grid>
            </ErrorBoundary>
        </Grid>
      </ErrorBoundary>
    </>
  );
};

export default DashBoard;