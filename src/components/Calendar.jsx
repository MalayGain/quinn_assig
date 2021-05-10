import React,{useState,useEffect} from "react";

import {motion,useCycle} from 'framer-motion'

import dateFns from "date-fns";

function Calendar () {

                                     //API call.....

  const [dates,setDates]=useState([]);
  const [mediaurls,setMediaurls]=useState([]);
  const [ratings,setRatings]=useState([]);
  const [daytypes,setDaytypes]=useState([]);

  const[animate,cycleCard]=useCycle({scale:1.0},{scale:5});
  
  useEffect(() => {
    getData()
  }, []);


   const getData =async() =>{

    // POST request using fetch with async/await
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "requestobjects": [
            {
              "posts": {
                "operationtype": "read",        
                "id": {
                  "return": true
                },
                "userid": {
                    "searchvalues" : ["41329663-5834-11eb-8e6e-3ca82abc3dd4"],
                  "return": true
                },
                "iscalendarentry": {
                    "searchvalues" : ["true"],
                  "return": true
                },        
                "media": {
                  "return": true //contains image url
                },
                "rating": {
                  "return": true
                },
                "text": {
                  "return": true
                },
                "privacy": {
                  "searchvalues": [
                    18
                  ],
                  "return": true
                },
                "typeofday": {
                  "return": true
                },
        
                // Don't change anything above ^^	
                //editable variables start below //
        
                "calendardatetime": { // Date Time of a particular post
                  "return": true  , // please note: there can be multiple posts on a single day
                  "sort" : "descending" // you can sort fetched dates by ascending/descending.
                },
                "maxitemcount": "20",   //you can ask between 1 to 50 posts (max) at a time.
                "continuationtoken": null //replace with the continuation token from response to get the next set
              }
            }
          ]
        })
    };


   await fetch('http://devapi.quinn.care/graph', requestOptions)
     .then((response)=> response.json())
     .then((data)=>{
        //const users =data.responseobjects.map((user)=>console.log(user))
        const dates=data.responseobjects[0].posts.map((post)=>(
          post.calendardatetime.substr(0,10)
        ));
        
        setDates(dates);

        const mediaurls=data.responseobjects[0].posts.map((post)=>(
          post.media[0].mediaurl
        ));
        setMediaurls(mediaurls);

        const ratings=data.responseobjects[0].posts.map((post)=>(
          post.rating
        ));
        setRatings(ratings);

        const daytypes=data.responseobjects[0].posts.map((post)=>(
          post.typeofday
        ));
        setDaytypes(daytypes);//array of arrays
        
     })
  };   
















                               // For rendering calender ..........







  const[currentMonth,setCurrentMonth]=useState(new Date());
  const[selectedDate,setSelectedDate]=useState(new Date());


  const renderHeader=() =>{
    const dateFormat = "MMMM YYYY";

    return (
      <div className="header row flex-middle">
        <div className="col col-start">
          <div className="icon" onClick={prevMonth}>
            chevron_left
          </div>
        </div>
        <div className="col col-center">
          <span>{dateFns.format(currentMonth, dateFormat)}</span>
        </div>
        <div className="col col-end" onClick={nextMonth}>
          <div className="icon">chevron_right</div>
        </div>
      </div>
    );
  }

  const renderDays=()=> {
    const dateFormat = "dddd";
    const days = [];

    let startDate = dateFns.startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center" key={i}>
          {dateFns.format(dateFns.addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="days row">{days}</div>;
  }

  const renderCells=() =>{
    //const { currentMonth, selectedDate } = this.state;
    const monthStart = dateFns.startOfMonth(currentMonth);
    const monthEnd = dateFns.endOfMonth(monthStart);
    const startDate = dateFns.startOfWeek(monthStart);
    const endDate = dateFns.endOfWeek(monthEnd);

    const date=dateFns.format(selectedDate,'YYYY-MM-DD')
    console.log(date);
    
    const dateFormat = "D";
    
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {


        const index=dates.indexOf(dateFns.format(day,'YYYY-MM-DD').toString());
        if(index!==-1)
        {
          formattedDate = dateFns.format(day, dateFormat);

          console.log(daytypes[index][0]);
          days.push(
            <motion.div className="col cell" onTap={()=>cycleCard()} animate={animate}>
              <p><span className="number">{formattedDate}</span></p>
              <div className="rating">
                    {Array(ratings[index])
                      .fill()
                      .map((_, i)=>(
                        <span style={{color:'#1a8fff'}}> &#9733;</span> 
                        


            
                      ))
                    }   
               </div>     
                
              
              
              <img className="card-img" src={mediaurls[index]} alt="user" />
              <div style={{textAlign:'center'}} >
                    {Array(daytypes[index].length)
                      .fill()
                      .map((_, i)=>(
                        <span style={{margin:5,width:20,height:20,backgroundColor:'#ddebf1'}}>{daytypes[index][i].charAt(0).toUpperCase()+daytypes[index][0].charAt(1)}</span>
                        
                        


            
                      ))
                    }   
               </div>   
              
              

            </motion.div>
          );
           
        }
        else{
          formattedDate = dateFns.format(day, dateFormat);
          const cloneDay = day;
          days.push(
            <div
              className={`col cell ${
                !dateFns.isSameMonth(day, monthStart)
                  ? "disabled"
                  : dateFns.isSameDay(day, selectedDate) ? "selected" : ""
              }`}
              key={day}
              onClick={() => onDateClick(dateFns.parse(cloneDay))}
            >
              <span className="number">{formattedDate}</span>
              <span className="bg">{formattedDate}</span>
            </div>
          );
        }
        
        
        day = dateFns.addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  }

  const onDateClick = day => {
    setSelectedDate(day);
    return(
       <div>
         {/* expanding the card*/ }
       </div>
    );
  };

  const nextMonth = () => {
    setCurrentMonth(dateFns.addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(dateFns.subMonths(currentMonth, 1));
  };


  return (
    <div className="calendar">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
    </div>
  );
  
}

export default Calendar;
