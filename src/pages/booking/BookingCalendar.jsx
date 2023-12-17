import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Avatar,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import Label from 'src/components/label/Label';
import BookingDetailSkeleton from 'src/components/skeleton/BookingDetailSkeleton';
import { useModal } from 'src/hooks/useModal';
import { getAllBookings, getBookingDetail } from 'src/services/booking/bookingSlice';
import formatCurrency from 'src/utils/formatPrice';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// const events = [
//   {
//     title: 'MRI Registration',
//     start: moment('2023-06-05T10:00:00').toDate(),
//     end: moment('2023-06-05T11:00:00').toDate(),
//   },
//   {
//     title: 'ENT Appointment',
//     start: moment('2023-06-05T14:00:00').toDate(),
//     end: moment('2023-06-05T15:30:00').toDate(),
//   },
// ];

function BookingCalendarPage() {
  const dispatch = useDispatch();

  const { toogleOpen: toogleOpenDetail, isOpen: isOpenDetail } = useModal();

  const { booking, bookings, isLoading } = useSelector((state) => state.booking);

  console.log('bookingCalendar', bookings);

  const [list, setList] = useState([]);

  let listBooking = [];
  useEffect(() => {
    for (let booking of bookings) {
      let date = booking.date.split('T', 1);
      let start = booking.start.split(' ', 1);
      let end = booking.end.split(' ', 1);
      let plusDate = date[0].split('-', 3);
      let finalDate = Number(plusDate[2]) + 1;
      let startDate = plusDate[0] + '-' + plusDate[1] + '-' + finalDate + 'T' + start + ':00';
      let endDate = plusDate[0] + '-' + plusDate[1] + '-' + finalDate + 'T' + end + ':00';
      console.log('start', startDate);
      console.log('end', endDate);
      const newBookings = {
        ...booking,
        start: moment(startDate).toDate(),
        end: moment(endDate).toDate(),
        title: `${booking.sportCenter?.name}, ${booking.sportField?.fieldType}`,
      };
      listBooking.push(newBookings);
    }
    setList(listBooking);
    console.log('listBooking', listBooking);
  }, [dispatch, bookings, booking, listBooking]);

  const handleGetDetail = (event) => {
    if (event._id) {
      dispatch(getBookingDetail(event._id));
      toogleOpenDetail();
    }
  };

  useEffect(() => {
    dispatch(getAllBookings());
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title> Thông tin đặt sân | TheThaoPlus </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Thông tin đặt sân dạng lịch
          </Typography>
        </Stack>

        <Card sx={{ p: 2 }}>
          <Calendar
            localizer={localizer}
            events={list}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={(myEventsList) => {
              const backgroundColor = '#00C187';
              const color = 'white';
              const border = 'solid 1px white';
              return { style: { backgroundColor, color, border } };
            }}
            onSelectEvent={handleGetDetail}
          />
        </Card>
      </Container>

      {isOpenDetail && (
        <Dialog maxWidth="md" open={isOpenDetail} onClose={toogleOpenDetail}>
          <DialogContent sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Thông tin đặt sân chi tiết
            </Typography>
            {isLoading ? (
              <BookingDetailSkeleton />
            ) : (
              <Grid container spacing={2}>
                <Grid item sm={12} md={4}>
                  <img
                    src={booking.sportCenter?.image}
                    alt={booking.sportCenter?.name}
                    style={{ borderRadius: '10px' }}
                  />

                  <Stack direction="column" mt={2} gap={1}>
                    <Typography variant="subtitle1" color="main.main">
                      Thông tin khách hàng:
                    </Typography>

                    <Stack direction="row" alignItems="center" gap={1}>
                      <Avatar />

                      <Stack>
                        <Typography variant="subtitle1">{booking.userBooking}</Typography>
                        <Typography>{booking.phoneBooking}</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item sm={12} md={8}>
                  <Stack gap={1}>
                    <Typography variant="h4" color="main.main">
                      {booking.sportCenter?.name}
                    </Typography>

                    <Stack direction="row" alignItems="start">
                      <LocationOnIcon color="main" />
                      <Typography>{booking.sportCenter?.address}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography>Sân:</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>{booking.sportField?.fieldType}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography>Ngày đặt:</Typography>
                      <Typography variant="subtitle1">{moment(booking.date).format('D-M-YYYY')}</Typography>
                    </Stack>

                    <Stack direction="row" gap={5}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography>Thời gian bắt đầu:</Typography>
                        <Typography variant="subtitle1">{booking.start}</Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography>Thời gian kết thúc:</Typography>
                        <Typography variant="subtitle1">{booking.end}</Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={13}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography>Trạng thái:</Typography>
                        <Label color={(booking.tracking === 'Pending' && 'warning') || 'success'}>
                          {booking.tracking}
                        </Label>
                      </Stack>

                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography>Thanh Toán:</Typography>
                        <Label color={(booking.payments === true && 'success') || 'error'}>
                          {booking.payments ? 'Paymented' : 'No payments'}
                        </Label>
                      </Stack>
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                      sx={{ backgroundColor: 'grey.200', p: 1, mt: 2 }}
                    >
                      <Typography variant="h5">Tổng tiền:</Typography>
                      <Typography variant="h5" sx={{ color: 'main.main' }}>
                        {formatCurrency(booking.totalPrice)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="secondary" size="small" onClick={toogleOpenDetail}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

export default BookingCalendarPage;
