import { Event } from "@/lib/tba_api/types.js";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Link,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from "@mui/material";

export default function EventDetails({ event }: { event: Event }) {
    const tbaLink = "https://www.thebluealliance.com/event/" + event.key;
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography component="span">{event.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>TBA Link</TableCell>
                            <TableCell>
                                <Link target="_blank" href={tbaLink}>
                                    {tbaLink}
                                </Link>
                            </TableCell>
                        </TableRow>
                        {event.website ? (
                            <TableRow>
                                <TableCell>Website</TableCell>
                                <TableCell>
                                    <Link target="_blank" href={event.website}>
                                        {event.website}
                                    </Link>
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        ) : null}
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>
                                {event.start_date}&nbsp;-&nbsp;{event.end_date}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </AccordionDetails>
        </Accordion>
    );
}
