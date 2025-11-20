import { Check } from "lucide-react"
import { motion } from "framer-motion"
import clsx from "clsx"

type StepItemProps = {
    index: number
    title: string
    subTitle: string
    completed: boolean
    isLast: boolean
    isCurrent: boolean
}

const StepItem = ({ index, title, subTitle, completed, isLast, isCurrent }: StepItemProps) => {
    const isFaded = !completed

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={clsx(
                "flex items-start gap-3 mb-2 transition-opacity duration-300",
                isFaded && "opacity-60"
            )}
        >
            <div className="flex flex-col items-center">
                <div
                    className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 z-10",
                        completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-bluePrimary text-bluePrimary"
                    )}
                >
                    {completed ? <Check size={18} /> : <span className="font-bold">{index + 1}</span>}
                </div>

                {!isLast && (
                    <div
                        className={clsx(
                            "w-1 h-6 mt-1",
                            completed ? "bg-green-500" : "bg-bluePrimary"
                        )}
                    />
                )}
            </div>

            <div className="flex-1 mt-1">
                <p className="text-sm font-medium">{title}</p>
                {subTitle && <p className="text-xs text-textSecondary">{subTitle}</p>}
            </div>

            {isCurrent && !completed && (
                <button className="btn-primary mr-4">Start</button>
            )}
        </motion.div>
    )
}

export { StepItem }
