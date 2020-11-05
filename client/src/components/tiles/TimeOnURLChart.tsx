import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush, PieChart, Pie } from 'recharts';
import axios from 'axios';

export interface AllUsers {
    userId: string;
    username: string;
    login: number;
    signin: number;
    admin: number;
    home: number;
  }

export interface InHours {
    name: string;
    value: number;
  }

export const TimeOnURLChartBar: React.FC = () => {

  const [allUsers, setallUsers] = useState<AllUsers[]>();

  useEffect(() => {
    async function fetch() {
      const { data: allUsers } = await axios.get(`http://localhost:3001/events/chart/timeonpage/allusers`);
      setallUsers(allUsers);
    }

    fetch();
  }, []);

    return (
    <>
            <div className="barChart">
                <h1>Time On URL (in sec)</h1>
                
                <ResponsiveContainer height="77%">
                    <BarChart
			        	data={allUsers}
			        	margin={{
			        		top: 20, right: 30, left: 20, bottom: 5,
			        	}}
			        >
			        	<CartesianGrid strokeDasharray="3 3" />
			        	<XAxis dataKey="username" />
                        <YAxis />
			        	<Tooltip />
			        	<Legend />
                        <Brush dataKey="username" height={30} stroke="#8884d8" />
			        	<Bar dataKey="login" fill="#aaaaaa" />
			        	<Bar dataKey="signin" fill="#8884d8" />
			        	<Bar dataKey="admin" fill="#ff0000" />
			        	<Bar dataKey="home" fill="#82ca9d" />
			        </BarChart>
                </ResponsiveContainer>
            </div>
    </>
  );
};


export const TimeOnURLChartPie: React.FC = () => {

    const [inHours, setInHours] = useState<InHours[]>();
    
    useEffect(() => {
        async function fetch() {
          const { data: inHours } = await axios.get(`http://localhost:3001/events/chart/timeonpage/inhours`);
          setInHours(inHours);
          console.log("hours", inHours);
          
        }
    
        fetch();
      }, []);

		return (
            <div className="pieChart">
                <h1>Time On URL Of All Users Average (in hours)</h1>
                <ResponsiveContainer width="100%" height="70%">
			        <PieChart>
                        <Pie data={inHours} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" />
                        <Pie data={inHours} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d" label />
			        	<Tooltip />
                <Legend />
			        </PieChart>
                </ResponsiveContainer>
            </div>
		);
	}
