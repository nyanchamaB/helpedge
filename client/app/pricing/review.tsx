"use client";
import React from "react";
import {Typography, Paper, Divider} from '@mui/material';
import { Card } from '@/components/ui/card';
export default function Review() {
  return (
    <><div>
        <Card className="p-6">
            <Typography variant="h6" gutterBottom>
                Review Your Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    User Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>Name: John Doe</Typography>
                <Typography>Email: john.doe@example.com</Typography>
                <Typography>Phone: +1234567890</Typography>
                <Typography>Company: Example Inc.</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Address Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>Street: 123 Main St</Typography>
                <Typography>City: Anytown</Typography>
                <Typography>State: CA</Typography>
                <Typography>Zip: 12345</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Payment Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>Card Number: **** **** **** 1234</Typography>
                <Typography>Expiry Date: 12/25</Typography>
                <Typography>CVV: ***</Typography>
            </Paper>
        </Card>
    </div>
</>
    );
}