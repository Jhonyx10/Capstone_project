const CARD =
    "rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900";

// One pulsing placeholder block
export const Bone = ({ className = "" }) => (
    <div
        className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
    />
);

export const AreaRowSkeleton = () => (
    <li className="rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
            <Bone className="h-4 w-32" />
            <Bone className="h-3 w-8" />
        </div>
        <Bone className="mt-3 h-1.5 w-full rounded-full" />
    </li>
);

const OperationDetailsSkeleton = () => (
    <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className="mx-auto max-w-7xl p-4 sm:p-6"
    >
        <span className="sr-only">Loading operation...</span>

        {/* Header */}
        <div className="mb-6">
            <Bone className="mb-4 h-4 w-24" /> {/* back link */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Bone className="h-8 w-56 sm:w-72" /> {/* title */}
                        <Bone className="h-6 w-20 rounded-full" /> {/* badge */}
                    </div>
                    <Bone className="mt-3 h-4 w-72 max-w-full" />{" "}
                    {/* subtitle */}
                </div>
                <div className="flex flex-wrap gap-3">
                    <Bone className="h-9 w-48 rounded-lg" /> {/* event date */}
                    <Bone className="h-9 w-40 rounded-lg" /> {/* status */}
                </div>
            </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`${CARD} px-4 py-3`}>
                    <Bone className="h-3 w-14" />
                    <Bone className="mt-2 h-7 w-10" />
                </div>
            ))}
        </div>

        {/* Map + side column */}
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div
                className={`${CARD} relative h-[420px] overflow-hidden lg:h-[640px]`}
            >
                <div className="h-full w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="flex flex-col gap-4">
                <div className={`${CARD} p-4`}>
                    <div className="mb-3 flex items-center justify-between">
                        <Bone className="h-5 w-24" />
                        <Bone className="h-8 w-28 rounded-lg" />
                    </div>
                    <ul className="flex flex-col gap-2">
                        {[0, 1, 2].map((i) => (
                            <AreaRowSkeleton key={i} />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

export default OperationDetailsSkeleton;
