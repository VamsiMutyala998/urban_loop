<template>
  <div class="row main-container">
    <div class="col-xs-12 text-center">
      <img :src="images.autoRickShaw" width="70px" alt="Auto Rickshaw" />
      <img :src="images.qrImageIcon" class="qr-icon" alt="QR Image" @click="$router.push({ name: 'DriverInfo' })" />
      <img :src="images.flashRideLogo" width="100%" class="mt-2" alt="Flash Ride Logo" />
      <div v-if="rideDetails?.length" class="rides-container">
        <div v-for="(ride) in rideDetails" :key="ride?.ride_id" class="card ride-card">
          <div class="card-body">
            <p class="card-text mb-1">
              <b>Destination - </b>
              <span>{{ ride?.dest_address?.split(',')[0] }}</span>
            </p>
            <div class="row">
              <div class="col-xs-6 col-sm-6 text-center">
                <b>Other's Avg Price - </b>{{ (ride?.price - 20) }}
              </div>
              <div class="col-xs-6 col-sm-6 text-center">
                <b>Flash Ride Price -</b> {{ Number(ride?.price) }}
              </div>
            </div>
            <div class="btn-container">
              <button class="btn btn-success p-1 px-3 me-2" @click="acceptRide(ride)">Accept</button>
              <button class="btn btn-danger p-1 px-3" @click="rejectRide(ride?.ride_id)">Decline</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-rides-container">
        <h4>No Rides Found!</h4>
      </div>
    </div>
    <div class="col-xs-12">
      <img :src="images.logo" alt="Urban Loop Logo" class="urban-loop-logo" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { images } from '../../../assets/images';
import DriverService from '../../../services/driver.service';
import { toast } from '@steveyuowo/vue-hot-toast';
import { getItemFromLocalStorage } from '../../../utils/helper';

const driverService = new DriverService();

export default {
  name: 'RideDecision',
  data() {
    return {
      images,
      rideDetails: [],
    };
  },
  computed: {
    ...mapGetters({
      driverId: 'getDriverId',
      driverInfo: 'getDriverInfo',
      driverMobileNumber: 'getDriverMobileNumber',
    }),
  },
  created() {
    const driverMobileNumber = getItemFromLocalStorage('driver_mobile_number');
    if (driverMobileNumber) {
      this.setDriverMobileNumber(driverMobileNumber);
    }
    this.getDriverId();
    this.getRideInfo();
  },
  methods: {
    ...mapActions([
      'setIsLoading',
      'setLoadingMessage',
      'setDriverActiveRideDetails',
      'setDriverInfo',
      'setDriverMobileNumber',
    ]),
    async getDriverId() {
      try {
        const driverResponse = await driverService.getDriverId(this.driverMobileNumber);
        this.setDriverInfo(driverResponse?.data || {});
      } catch (error) {
        toast.error('Failed to fetch driver info');
      }
    },
    async getRideInfo() {
      try {
        this.setIsLoading(true);
        this.setLoadingMessage('Fetching your active rides. Please wait...');
        const rideResponse = await driverService.rideInfo(this.driverMobileNumber);
        if (rideResponse?.status === 200) {
          if (rideResponse?.data?.ride_status === 'started' || rideResponse?.data?.ride_status === 'accepted') {
            this.setDriverActiveRideDetails(rideResponse?.data);
            this.setIsLoading(false);
            this.setLoadingMessage('');
            this.$router.push({ name: 'DriverRideConfirmation' });
          } else {
            this.getActiveRides();
          }
        }
      } catch (error) {
        toast.error('Failed to fetch your ride info details. Please try again');
      } finally {
        this.setIsLoading(false);
        this.setLoadingMessage('');
      }
    },
    async getActiveRides() {
      try {
        const activeRidesResponse = await driverService.getActiveRides(this.driverMobileNumber);
        if (activeRidesResponse?.data?.length) {
          this.rideDetails = [...activeRidesResponse?.data];
        }
      } catch (error) {
        toast.error('Failed to fetch your active rides. Please try again');
      }
    },
    async acceptRide(rideDetails) {
      try {
        const rideResponse = await driverService.acceptRideById(rideDetails?.ride_id, this.driverInfo?.driver_id);
        if (rideResponse?.status === 200) {
          this.setDriverActiveRideDetails(rideDetails);
          this.$router.push({ name: 'DriverRideConfirmation' });
        }
      } catch (error) {
        toast.error('Failed to accept the ride. Please try again');
      }
    },
    async rejectRide(rideId) {
      try {
        const rideResponse = await driverService.rejectRideById(rideId);
        if (rideResponse?.status === 200) {
          const rideIndex = this.rideDetails.findIndex((ride) => ride?.ride_id === rideId);
          if (rideIndex > -1) {
            this.rideDetails.splice(rideIndex, 1);
          }
        }
      } catch (error) {
        toast.error('Failed to reject the ride. Please try again');
      }
    },
  }
};
</script>

<style lang="scss">
.main-container {
  font-family: Arial, Helvetica, sans-serif;

  .qr-icon {
    position: absolute;
    top: 4px;
    right: 10px;
    width: 40px;
    cursor: pointer;
  }

  .rides-container {
    max-height: 55vh;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 2;
    font-size: 13px;

    .ride-card {
      width: 15rem;
      padding: 0;
      text-align: start;
      margin-bottom: 10px;

      .card-body {
        padding: 7px 10px;
      }

      &::-webkit-scrollbar {
        display: none; /* WebKit-based browsers */
      }

      .btn-container {
        display: flex;
        justify-content: center;
        margin-top: 7px;

        button {
          font-size: 12px !important;
        }
      }
    }
  }


  .no-rides-container {
    height: 45vh;
    display: flex;
    align-items: center;
    justify-content: center;

    h4 {
      font-weight: bold;
    }
  }

  .price-info {
    font-size: 16px;
    font-weight: 700;
  }

  .urban-loop-logo {
    width: 100%;
    position: absolute;
    bottom: 20px;
    left: 0;
  }
}
</style>
