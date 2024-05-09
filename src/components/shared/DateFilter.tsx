// Importing necessary libraries and components
import React, { useEffect } from 'react'
import { CalendarIcon, CrossIcon, SidebarCloseIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { date } from "zod";
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

// Interface for the DateFilter component props
interface DateFilterProps {
    page: string,
    initialDate?: Date | null,
    searchParam?: string,
    cookieName?: string
}

// DateFilter component
const DateFilter: React.FC<DateFilterProps> = ({ page, initialDate, searchParam = 'date', cookieName = 'date' }) => {
    // Using the Next.js router
    const router = useRouter()

    // State for the filter date
    const [filterDate, setFilterDate] = React.useState<Date | null>(initialDate!)

    // Function to handle date change
    const handleDateChange = () => {
        if (!filterDate) return

        try {
            // Push the new date to the router
            router.push(`${page}?${searchParam}=${format(filterDate, "yyyy-MM-dd")}`)
        } catch (error) {
            console.error("Error changing date", error)
        }
    }

    const handleClear = () => {
        setFilterDate(null)
        router.push(page)
    }

    // Effect to handle date change when filterDate changes
    useEffect(() => {
        if (!filterDate) return

        handleDateChange()

        // Save the date to the cookie
        document.cookie = `${cookieName}=${format(filterDate, "yyyy-MM-dd")}; path=/`

        // eslint-disable-next-line
    }, [filterDate])

    // // on page load get the date from the cookie if not provided
    // useEffect(() => {
    //     if (!initialDate) {
    //         const date = document.cookie
    //             .split('; ')
    //             .find(row => row.startsWith(`${cookieName}=`))
    //             ?.split('=')[1]
    //         if (date) {
    //             setFilterDate(new Date(date))
    //         }
    //     }
    //     // eslint-disable-next-line
    // }, [])

    // Render the component
    return (
        <form>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterDate ? format(filterDate, "PPP") : <span>Due date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="flex w-auto flex-col space-y-2 p-2"
                >
                    <Select
                        onValueChange={(value: any) =>
                            setFilterDate(addDays(new Date(), parseInt(value)))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="0">Today</SelectItem>
                            <SelectItem value="1">Tomorrow</SelectItem>
                            <SelectItem value="3">In 3 days</SelectItem>
                            <SelectItem value="7">In a week</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="rounded-md border">
                        <Calendar mode="single" disabled={() => {
                            return false
                        }} selected={filterDate || new Date()} onSelect={setFilterDate as any} />
                    </div>
                    {
                        filterDate && (
                            <Button onClick={handleClear} variant={'outline'} className="w-full text-red-400">
                                Clear Selection <X className='ml-2' />
                            </Button>
                        )
                    }
                </PopoverContent>
            </Popover>
        </form>)
}

export default DateFilter