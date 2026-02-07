import { Typography } from "@mui/material";

export function TBALogo() {
    return (
        <div
            style={{
                display: "inline-flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
            }}
            onClick={() => window.open("https://www.thebluealliance.com/")}
        >
            <img
                src={`data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MiIgaGVpZ2h0PSIxMTIiIHZpZXdCb3g9IjAgMCA3MiAxMTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik04IDIwaDZ2NjRIOHptNTAgMGg2djY0aC02em0tMjIgOTJDMjAuNTYxIDExMiA4IDk5LjQzOSA4IDg0aDZjMCAxMi4xMzEgOS44NjkgMjIgMjIgMjJ6bTAgMHYtNmMxMi4xMzEgMCAyMi05Ljg2OSAyMi0yMmg2YzAgMTUuNDM5LTEyLjU2MSAyOC0yOCAyOCIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zMyAyMGg2djg5aC02eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMSA3OGg1MHY2SDExem0wLTI4aDUwdjZIMTF6bTYxLTI2YzAgMi4yLTEuOCA0LTQgNEg0Yy0yLjIgMC00LTEuOC00LTRWNGMwLTIuMiAxLjgtNCA0LTRoNjRjMi4yIDAgNCAxLjggNCA0eiIvPjwvc3ZnPg==`}
                height={22}
            />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                &nbsp;The Blue Alliance
            </Typography>
        </div>
    );
}
