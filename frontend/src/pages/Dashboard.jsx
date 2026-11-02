
// assets
import { FaCalendarAlt } from "react-icons/fa";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { IoTimeSharp } from "react-icons/io5";
import { MdPeopleAlt } from "react-icons/md";
import { IoMegaphoneSharp } from "react-icons/io5";
import { FaDotCircle } from "react-icons/fa";

// components and hooks
import { motion } from "framer-motion";
import ViolatorsList from "../components/ViolatorsList";
import ReactMiniMap from "../components/map/ReactMiniMap";
import ZonalIncidentCard from "../components/ZonalIncidentCard";
import useAppState from "../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getReports } from "../functions/ReportsApi";
import { useEffect } from "react";

//analytical hooks
import useMonthsCurPrev from "../hooks/useMonthsCurPrev";
import useCurPrevResponseTime from "../hooks/useCurPrevResponseTime";
import useRegisteredUsers from "../hooks/useRegisteredUsers";
import useRequest from "../hooks/useTotalRequest";

const Dashboard = () => {
  const { base_url, token, setReports } = useAppState();
  
    const { data: curPrev } = useMonthsCurPrev();
    const { data: responseTime} = useCurPrevResponseTime();
    const { data: registeredUsers } = useRegisteredUsers();
    const { data: request } = useRequest();

    const current = curPrev?.current_total ?? 0;
    const previous = curPrev?.previous_total ?? 0;

    // Calculate absolute increase
    const increase = current - previous;

    // Calculate percentage change safely
    let percentChange = 0;

    if (previous > 0) {
        percentChange = ((current - previous) / previous) * 100;
    } else if (current > 0) {
        percentChange = 100; // default when previous is 0
    }

    // Round to 2 decimal places
    percentChange = Math.round(percentChange * 100) / 100;


    const registered_users = 
        (registeredUsers?.current_month_registered ?? 0) -
        (registeredUsers?.previous_month_registered ?? 0)

    const total_request = (request?.current_month_total ?? 0) - (request?.previous_month_total ?? 0)

    const response_time =
        (responseTime?.current_response ?? 0) -
        (responseTime?.previous_response ?? 0);

      const { data } = useQuery({
          queryKey: ["reports"],
          queryFn: () => getReports({ base_url, token }),
          onSuccess: (data) => {
              console.log(data);
          },
      });

         useEffect(() => {
             if (data) {
                 setReports(data);
             }
         }, [data]);

    return (
        <motion.div
            layout
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className="px-6 pt-4 pb-6 "
        >
            <motion.h1
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="dark:text-white text-gray-700 font-medium text-2xl"
            >
                Dashboard
            </motion.h1>
            {/* 4boxes summary of incidents */}
            <motion.div className="flex lg:grid-cols-4 md:grid-cols-2 md:grid gap-4 overflow-x-auto hide-scrollbar py-4 ">
                {/* Monthly box report */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.1,
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="flex  flex-col bg-white text-white dark:bg-slate-900 p-3 rounded-md shadow-lg border-1 dark:border-0 border-gray-200 "
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.2,
                        }}
                        className="flex flex-row items-center justify-between"
                    >
                        <motion.div className="flex flex-row items-center space-x-1 ">
                            <FaCalendarAlt color="#22c55e" size={20} />
                            <h1 className="text-gray-700 dark:text-white font-medium">
                                Monthly Report
                            </h1>
                        </motion.div>
                        <motion.div className="transform rotate-30 ">
                            <FaRegArrowAltCircleUp color="#22c55e" size={26} />
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.2,
                        }}
                        className="text-2xl font-bold  dark:border-b-1 border-b-1 border-b-gray-400 max-w-2/3 pb-2"
                    ></motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.3,
                        }}
                        className="flex items-center space-x-10 mt-2"
                    >
                        <motion.div className="flex items-center space-x-2">
                            {" "}
                            <p className="text-3xl text-gray-700 dark:text-white">
                                {curPrev?.current_total ?? 0}
                            </p>
                            <p className="text-xs leading-tight text-gray-700 dark:text-white">
                                Incidents reported
                                <span className="block text-gray-700 dark:text-white">
                                    this month
                                </span>
                            </p>
                        </motion.div>

                        <motion.div className="p-0.5 rounded-md bg-green-500">
                            <p className="text-xs leading-tight ">
                                {increase > 0
                                    ? `+${percentChange}%`
                                    : `${percentChange}%`}
                            </p>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.4,
                        }}
                        className="flex items-center mt-4"
                    >
                        <span className="text-xl mr-1 text-green-700">
                            {increase}
                        </span>
                        <p className="text-xs leading-tight text-gray-700 dark:text-white">
                            Incidents from previous month
                        </p>
                    </motion.div>
                </motion.div>
                {/* average response time box  */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.2,
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col bg-white text-white dark:bg-slate-900 p-3 rounded-md shadow-lg border-1 dark:border-0 border-gray-200"
                    border-1
                    dark:border-0
                    border-gray-200
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.3,
                        }}
                        className="flex flex-row items-center justify-between"
                    >
                        <motion.div className="flex flex-row items-center space-x-1 ">
                            <IoTimeSharp color="#22c55e" size={24} />
                            <h1 className="text-gray-700 dark:text-white font-medium">
                                Avg response time
                            </h1>
                        </motion.div>
                        <motion.div className="transform rotate-30 ">
                            <FaRegArrowAltCircleUp color="#22c55e" size={26} />
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.3,
                        }}
                        className="text-2xl font-bold text-gray-900 dark:border-b-1 border-b-1 border-b-gray-400 max-w-2/3 pb-2"
                    ></motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.4,
                        }}
                        className="flex items-center space-x-10 mt-2"
                    >
                        <motion.div className="flex items-center space-x-2">
                            {" "}
                            <p className="text-3xl text-gray-700 dark:text-white">
                                {(responseTime?.current_response ?? 0).toFixed(
                                    1
                                )}
                            </p>
                            <p className="text-xs leading-tight text-gray-700 dark:text-white">
                                mins response
                                <span className="block text-gray-700 dark:text-white">
                                    time
                                </span>
                            </p>
                        </motion.div>

                        <motion.div className="p-0.5 rounded-md bg-green-500">
                            <p className="text-xs leading-tight">
                                {(responseTime?.percent_change ?? 0).toFixed(1)}%
                            </p>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.5,
                        }}
                        className="flex items-center mt-4"
                    >
                        <span className="text-xl mr-1 text-green-700">
                            {(response_time).toFixed(1)}
                        </span>
                        <p className="text-xs leading-tight text-gray-700 dark:text-white">
                            increase from last month
                        </p>
                    </motion.div>
                </motion.div>
                {/* Total registered residents box */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.3,
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col bg-white text-white dark:bg-slate-900 p-3 rounded-md shadow-lg border-1 dark:border-0 border-gray-200"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.4,
                        }}
                        className="flex flex-row items-center justify-between"
                    >
                        <motion.div className="flex flex-row items-center space-x-1 ">
                            <MdPeopleAlt color="#22c55e" size={24} />
                            <h1 className="text-gray-700 dark:text-white font-medium leading-tight">
                                Registered residents
                            </h1>
                        </motion.div>
                        <motion.div className="transform rotate-30 ">
                            <FaRegArrowAltCircleUp color="#22c55e" size={26} />
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.3,
                        }}
                        className="text-2xl font-bold text-gray-900 dark:border-b-1 border-b-1 border-b-gray-400  max-w-2/3 pb-2"
                    ></motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.5,
                        }}
                        className="flex items-center space-x-10 mt-2"
                    >
                        <motion.div className="flex items-center space-x-2">
                            {" "}
                            <p className="text-3xl text-gray-700 dark:text-white">
                                {/* {registeredUsers.current_month_registered ?? 0} */}
                            </p>
                            <p className="text-xs leading-tight text-gray-700 dark:text-white">
                                people report
                                <span className="block text-gray-700 dark:text-white">
                                    this month
                                </span>
                            </p>
                        </motion.div>

                        <motion.div className="p-0.5 rounded-md bg-green-500">
                            <p className="text-xs leading-tight">
                                {registeredUsers?.monthly_registered ?? 0}%
                            </p>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.6,
                        }}
                        className="flex items-center mt-4"
                    >
                        <span className="text-xl mr-1 text-green-700">
                            {registered_users ?? 0}
                        </span>
                        <p className="text-xs leading-tight text-gray-700 dark:text-white">
                            registered user in recent months
                        </p>
                    </motion.div>
                </motion.div>
                {/* Current total request box */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.4,
                    }}
                    className="flex flex-col bg-white text-white dark:bg-slate-900 p-3 rounded-md shadow-lg border-1 dark:border-0 border-gray-200"
                    border-1
                    dark:border-0
                    border-gray-200
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.6,
                        }}
                        className="flex flex-row items-center justify-between"
                    >
                        <motion.div className="flex flex-row items-center space-x-1 ">
                            <IoMegaphoneSharp color="#22c55e" size={24} />
                            <h1 className="text-gray-700 dark:text-white font-medium">
                                Current total request
                            </h1>
                        </motion.div>
                        <motion.div className="transform rotate-30 ">
                            <FaRegArrowAltCircleUp color="#22c55e" size={26} />
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.3,
                        }}
                        className="text-2xl font-bold text-gray-900 dark:border-b-1 border-b-1 border-b-gray-400  max-w-2/3 pb-2"
                    ></motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.7,
                        }}
                        className="flex items-center space-x-10 mt-2"
                    >
                        <motion.div className="flex items-center space-x-2">
                            {" "}
                            <p className="text-3xl text-gray-700 dark:text-white">
                                {request?.current_month_total}
                            </p>
                            <p className="text-xs leading-tight text-gray-700 dark:text-white">
                                people report
                                <span className="block text-gray-700 dark:text-white">
                                    this month
                                </span>
                            </p>
                        </motion.div>

                        <motion.div className="p-0.5 rounded-md bg-green-500">
                            <p className="text-xs leading-tight">
                                {total_request}%
                            </p>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.8,
                        }}
                        className="flex items-center mt-4"
                    >
                        <span className="text-xl mr-1 text-green-700">
                            {request?.previous_month_total}
                        </span>
                        <p className="text-xs leading-tight text-gray-700 dark:text-white">
                            increase from last month
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>
            {/* chart and most violated list */}
            <motion.div className="lg:grid lg:grid-cols-3 flex flex-col mt-2 gap-3">
                {/* chart incidents report history */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.5,
                    }}
                    className="bg-white md:col-span-2 dark:bg-slate-900 rounded-md shadow-lg border-1  border-gray-200border-1 dark:border-0 border-gray-200 p-4"
                >
                    <div className="flex flex-row gap-1 mb-2">
                        {" "}
                        <FaDotCircle color="#22c55e" size={26} />
                        <p className="font-medium dark:text-white text-gray-700">
                            Reports Zonal Count
                        </p>
                    </div>

                    {/* <BarChart labels={labels} data={data} /> */}
                    <div className="flex flex-row justify-between gap-2">
                        {/* Left side map */}
                        <ReactMiniMap />
                        <ZonalIncidentCard />
                    </div>
                </motion.div>

                <ViolatorsList />
            </motion.div>
        </motion.div>
    );}
export default Dashboard;
