<template>
  <div class="market">
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>排名</th>
          <th style="width:10rem">币种</th>
          <th>流通市值(¥)</th>
          <th>价格(¥)</th>
          <th>流通数量</th>
          <th>24H量(¥)</th>
          <th>24H涨跌(¥)</th>
        </tr>
      </thead>
      <tbody v-if="!loading">
        <tr class v-for="item in list" :key="item.symbol">
          <td class="primary-color">
            <b>{{item.rank}}</b>
          </td>
          <td>
            <b>{{item.symbol}} </b>
            <small>{{item.name}}</small>
          </td>
          <td>{{parseFloat(item.market_cap_cny/100000000).toFixed(2)}}亿</td>
          <td>{{parseFloat(item.price_cny).toFixed(2)}}</td>
          <td>{{parseFloat(item.available_supply/10000).toFixed(2)}}万</td>
          <td>{{parseFloat(item['24h_volume_cny']/100000000).toFixed(2)}}亿</td>
          <td
            :class="{change:true, red:item.percent_change_24h<0}"
          >{{(item.percent_change_24h>0?'+':'')+item.percent_change_24h}}%</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top: 2rem;" class="text-center" v-if="loading">
      <div class="loading loading-lg"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

let interval = null;

export default {
  data() {
    return {
      list: [],
      loading: true,
    };
  },
  created() {
    this.updateMarket();

    interval = setInterval(() => {
      this.updateMarket();
    }, 60000);
  },
  beforeDestroy() {
    clearInterval(interval);
  },
  methods: {
    async updateMarket() {
      this.loading = true;
      const res = await axios.get('https://tt.w3c.market/api/all');
      if (res.list) {
        this.list = JSON.parse(res.list);
      }
      this.loading = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.market {
  padding-bottom: 3rem;
  .change {
    color: #00b45a;

    &.red {
      color: #ff6059;
    }
  }
}
</style>
