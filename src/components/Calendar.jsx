import React, { useEffect } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { get_user_tasks } from '../../api/client'
import DayCalendar from './DayCalendar'
import MonthCalendar from './MonthCalendar'

export const Calendar = () => {
  var { username } = useParams()
  var [tasks, set_tasks] = useState(null)
  var [active_calendar_type,set_active_calendar_type] = useState('month') //possible values : month, day
  async function fetch_tasks() {
    try {
      var response = await get_user_tasks({creator : username})
      set_tasks(response)
    } catch (error) {
      
    }
  }
  useEffect(() => {
    fetch_tasks()
  },[])
  return (
    <div>
      <h1>Calendar</h1>
      <div className='flex border border-blue-400'>
        <button className='border border-red-400' onClick={()=> set_active_calendar_type("month")}>month</button>
        <button className='border border-red-400' onClick={()=> set_active_calendar_type("day")}>day</button>
      </div>
      <div>
        {active_calendar_type === "month" && <MonthCalendar tasks={tasks}/>}
        {active_calendar_type === "day" && <DayCalendar tasks={tasks}/>}

      </div>
    </div>
  )
}
