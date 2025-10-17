import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useAppState from "../../store/useAppState";
import { getResidents } from "../../functions/ReportsApi";
import { blockUser } from "../../functions/AuthApi";

const ResidentsTable = () => {
    const { base_url, token, darkMode } = useAppState();

    const {
        data: residents,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["residents"],
        queryFn: () => getResidents({ base_url, token }),
    });

    // Mutation for blocking a user
    const userMutation = useMutation({
        mutationFn: ({ userId }) => blockUser({ base_url, token, userId }),
        onSuccess: () => {
            // Optionally refetch residents to update status
            queryClient.invalidateQueries(["residents"]);
        },
    });

    if (isLoading)
        return (
            <p className={darkMode ? "text-gray-200" : "text-gray-700"}>
                Loading...
            </p>
        );
    if (isError)
        return (
            <p className={darkMode ? "text-gray-200" : "text-gray-700"}>
                Failed to load residents.
            </p>
        );

    return (
        <motion.div
            layout
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.1,
            }}
            className="p-2"
        >
            <div
                className={`overflow-x-auto mt-4 rounded-lg shadow ${
                    darkMode ? "bg-slate-900" : "bg-white"
                }`}
            >
                <table className="min-w-full divide-y text-sm">
                    <thead
                        className={
                            darkMode
                                ? "bg-slate-800 text-gray-200"
                                : "bg-gray-50 text-gray-700"
                        }
                    >
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Total</th>
                            <th className="px-4 py-3 text-left">Fraud</th>
                            <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody
                        className={
                            darkMode
                                ? "bg-slate-900 text-gray-200"
                                : "bg-white text-gray-700"
                        }
                    >
                        {residents?.map((user, index) => {
                            const canceledRequests =
                                user.requests?.filter(
                                    (r) => r.status === "cancel"
                                ).length || 0;
                            return (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={
                                        index % 2 === 0
                                            ? darkMode
                                                ? "bg-slate-800"
                                                : "bg-white"
                                            : darkMode
                                            ? "bg-slate-900"
                                            : "bg-gray-50"
                                    }
                                >
                                    <td className="px-4 py-3">{user.id}</td>
                                    <td className="px-4 py-3">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">{user.role}</td>
                                    <td className="px-4 py-3">{user.status}</td>
                                    <td className="px-4 py-3">
                                        {user.requests?.length || 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        {canceledRequests}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() =>
                                                userMutation.mutate({
                                                    userId: user.id,
                                                })
                                            }
                                            className="bg-red-900 p-2 rounded-md hover:cursor-pointer hover:bg-red-600"
                                        >
                                            <span className="text-md font-bold">
                                               {user.status === 'block' ? "UnBlocked" : "Block"}
                                            </span>
                                        </button>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default ResidentsTable;
