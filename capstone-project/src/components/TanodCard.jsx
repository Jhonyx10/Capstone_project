import useAppState from "../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getTanodUser } from "../functions/UsersApi";
import { IoPersonCircleOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import UpdateTanod from "./details/UpdateTanod";
import { useState } from "react";

const TanodCard = () => {
    const { base_url, token } = useAppState();
    const [selectedId, setSelectedId] =useState(null)

    const { data, isLoading } = useQuery({
        queryKey:['volunteers'],
        queryFn: ()=> getTanodUser({base_url, token})
    });

    if (!data || data.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-300 text-center">
                No volunteers found.
            </p>
        );
    }

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.4,
                ease: "easeOut",
            },
        }),
    };

    return (
        <div className="flex flex-wrap gap-4">
            {data.map((volunteer, index) => {
                const profile = volunteer.profile;
                const fullName = `${profile?.first_name ?? ""} ${
                    profile?.last_name ?? ""
                }`;

                return (
                    <motion.div
                        key={volunteer.id}
                        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                    >
                        {/* Avatar */}
                        <div className="flex flex-col items-center p-4 border-b">
                            {profile?.photo ? (
                                <img
                                    className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow"
                                    src={profile.photo}
                                    alt={fullName}
                                />
                            ) : (
                                <IoPersonCircleOutline className="h-24 w-24 text-gray-400" />
                            )}

                            <h3 className="mt-4 font-bold text-xl text-gray-800 dark:text-white">
                                {fullName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Role: {volunteer.role}
                            </p>
                        </div>

                        {/* Info section */}
                        <div className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <div className="flex justify-between items-center">
                                <p>
                                    <span className="font-semibold">
                                        Call Sign:
                                    </span>{" "}
                                    {volunteer.name}
                                </p>
                                <button 
                                    onClick={() => setSelectedId(volunteer.id)}
                                    className="bg-green-600 p-1 rounded hover:cursor-pointer hover:bg-green-500">
                                    <p className="text-sm text-white">Change Password</p>
                                </button>
                            </div>
                            <p>
                                <span className="font-semibold">Email:</span>{" "}
                                {volunteer.email}
                            </p>
                            <p>
                                <span className="font-semibold">Age:</span>{" "}
                                {profile?.age}
                            </p>
                            <p>
                                <span className="font-semibold">Address:</span>{" "}
                                {profile?.address}
                            </p>
                            <p>
                                <span className="font-semibold">Zone:</span>{" "}
                                {profile?.zone?.zone_name}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
            {selectedId && (
                <UpdateTanod data={data} tanodId={selectedId} onClose={()=> setSelectedId(null)}/>
            )}
        </div>
    );
};

export default TanodCard;
