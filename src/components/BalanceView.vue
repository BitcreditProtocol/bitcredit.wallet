<template>
  <!-- <q-card class="q-my-md q-py-sm">
    <q-card-section class="q-mt-sm q-py-xs"> -->
  <div class="q-pt-xl q-pb-md">
    <div class="row justify-center q-pb-lg" style="height: 80px">
      <div v-if="globalMutexLock">
        <transition
          appear
          enter-active-class="animated pulse"
          leave-active-class="animated fadeOut"
        >
          <q-spinner-hourglass
            class="q-mt-lg q-mb-none"
            size="lg"
            color="primary"
          />
        </transition>
      </div>
      <div v-else>
        <transition
          appear
          enter-active-class="animated pulse"
          leave-active-class="animated fadeOut"
        >
          <ToggleUnit class="q-mt-lg q-mb-none" :balanceView="true" />
        </transition>
      </div>
    </div>

    <div v-if="bitcreditEnableCombinedBalanceView">
      <transition
        appear
        enter-active-class="animated fadeInDown"
        leave-active-class="animated fadeInDown"
        mode="out-in"
      >
        <div class="bg-transparent rounded-borders q-mb-xl q-mt-xl">
          <div class="">
            <h3
              class="q-my-none q-py-none cursor-pointer text-primary"
              @click="toggleHideBalance"
            >
              <strong
                class="flex gap-1 justify-center items-center q-my-none q-py-none"
              >
                <AnimatedNumber
                  :value="bitcreditTotalBalances.total"
                  :format="(val) => formatCurrency(val, '').trim()"
                  class="cursor-pointer"
                />
                <span v-if="!hideBalance" style="margin-left: 0.75rem"
                  >sat</span
                >
              </strong>
            </h3>

            <div v-if="bitcoinPrice" :class="{ invisible: hideBalance }">
              <strong>
                <AnimatedNumber
                  :value="
                    (bitcoinPrice / 100_000_000) * bitcreditTotalBalances.total
                  "
                  :format="(val) => formatCurrency(val, 'USD')"
                />
              </strong>
            </div>
          </div>

          <div :class="{ invisible: hideBalance }">
            <div class="row">
              <hr class="q-my-md col-3" />
            </div>

            <div class="row justify-center text-right">
              <div class="flex" style="font-size: 18px">
                <div class="row items-center">
                  <div class="col-9">
                    <strong class="q-my-none q-py-none text-white">
                      <AnimatedNumber
                        :value="bitcreditTotalBalances.crsat"
                        :format="(val) => formatCurrency(val, '').trim()"
                      />
                    </strong>
                  </div>
                  <div class="col-3">
                    <span style="margin-left: 0.5rem">crsat</span>
                  </div>

                  <div class="col-9">
                    <strong class="q-my-none q-py-none text-white">
                      <AnimatedNumber
                        :value="bitcreditTotalBalances.sat"
                        :format="(val) => formatCurrency(val, '').trim()"
                      />
                    </strong>
                  </div>
                  <div class="col-3">
                    <span style="margin-left: 0.5rem">drsat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- exchange rate -->
      <div
        class="row q-mb-none"
        v-if="bitcoinPrice"
        :class="{ invisible: hideBalance }"
      >
        <div class="col-12">
          <span class="q-my-none q-py-none text-weight-regular">
            Exchange rate:
            <b>
              <AnimatedNumber
                :value="bitcoinPrice"
                :format="
                  (val) => formatCurrency(val, 'USD').slice(1) + ' USD/BTC'
                "
                class="q-my-none q-py-none cursor-pointer"
              />
            </b>
          </span>
        </div>
      </div>
    </div>
    <div v-else>
      <transition
        appear
        enter-active-class="animated fadeInDown"
        leave-active-class="animated fadeInDown"
        mode="out-in"
      >
        <q-carousel
          v-model="this.activeUnit"
          transition-prev="jump-up"
          transition-next="jump-up"
          swipeable
          animated
          :height="$q.screen.width < 390 ? '130px' : '80px'"
          control-color="primary"
          class="bg-transparent rounded-borders q-mb-xl q-mt-xl text-primary"
        >
          <!-- make a q-carousel-slide with v-for for all possible units -->
          <q-carousel-slide
            v-for="unit in balancesOptions"
            :key="unit.value"
            :name="unit.value"
            class="q-pt-none"
          >
            <div class="row">
              <div class="col-12">
                <h3
                  class="q-my-none q-py-none cursor-pointer"
                  @click="toggleHideBalance"
                >
                  <strong>
                    <AnimatedNumber
                      :value="getTotalBalance"
                      :format="(val) => formatCurrency(val, activeUnit)"
                      class="q-my-none q-py-none cursor-pointer"
                    />
                  </strong>
                </h3>
                <div v-if="bitcoinPrice">
                  <strong v-if="this.activeUnit == 'sat'">
                    <AnimatedNumber
                      :value="(bitcoinPrice / 100000000) * getTotalBalance"
                      :format="(val) => formatCurrency(val, 'USD')"
                    />
                  </strong>
                  <strong
                    v-if="this.activeUnit == 'usd' || this.activeUnit == 'eur'"
                  >
                    <AnimatedNumber
                      :value="
                        (getTotalBalance / 100 / bitcoinPrice) * 100000000
                      "
                      :format="(val) => formatCurrency(val, 'sat')"
                    />
                  </strong>
                  <q-tooltip>
                    {{ formatCurrency(bitcoinPrice, "USD").slice(1) }}
                    USD/BTC</q-tooltip
                  >
                </div>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </transition>
      <!-- mint url -->

      <div class="row q-mt-md q-mb-none text-secondary" v-if="activeMintUrl">
        <div class="col-12 cursor-pointer">
          <span class="text-weight-light" @click="setTab('mints')">
            Mint: <b>{{ activeMintLabel }}</b>
          </span>
        </div>
      </div>
      <!-- mint balance -->
      <div class="row q-mb-none text-secondary" v-if="mints.length > 1">
        <div class="col-12">
          <span class="q-my-none q-py-none text-weight-regular">
            Balance:
            <b>
              <AnimatedNumber
                :value="getActiveBalance"
                :format="(val) => formatCurrency(val, activeUnit)"
                class="q-my-none q-py-none cursor-pointer"
              />
            </b>
          </span>
        </div>
      </div>
    </div>
  </div>
  <!-- pending -->
  <div class="row q-mt-xs q-mb-none" v-if="pendingBalance > 0">
    <div class="col-12">
      <q-btn
        name="history"
        size="sm"
        align="between"
        color="secondary"
        dense
        outline
        class="q-mx-none q-mt-xs q-pr-sm cursor-pointer"
        @click="checkPendingTokens()"
        ><q-icon name="history" size="1rem" class="q-mx-xs" /> Pending:
        {{ formatCurrency(pendingBalance, this.activeUnit) }}
        <q-tooltip>Check all pending tokens</q-tooltip>
      </q-btn>
    </div>
  </div>
  <!-- </q-card-section>
  </q-card> -->
</template>
<script>
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapState, mapWritableState, mapActions } from "pinia";
import { useMintsStore, MintClass } from "stores/mints";
import { useSettingsStore } from "stores/settings";
import { useTokensStore } from "stores/tokens";
import { useUiStore } from "stores/ui";
import { useWalletStore } from "stores/wallet";
import { usePriceStore } from "stores/price";
import ToggleUnit from "components/ToggleUnit.vue";
import AnimatedNumber from "components/AnimatedNumber.vue";
import axios from "axios";
import { map } from "underscore";

export default defineComponent({
  name: "BalanceView",
  mixins: [windowMixin],
  components: {
    ToggleUnit,
    AnimatedNumber,
  },
  props: {
    setTab: Function,
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "activeBalance",
      "mints",
      "totalUnitBalance",
      "activeUnit",
      "activeMint",
    ]),
    ...mapState(useTokensStore, ["historyTokens"]),
    ...mapState(useUiStore, ["globalMutexLock"]),
    ...mapState(usePriceStore, ["bitcoinPrice"]),
    ...mapWritableState(useMintsStore, ["activeUnit"]),
    ...mapWritableState(useUiStore, ["hideBalance", "lastBalanceCached"]),
    ...mapState(useSettingsStore, ["bitcreditEnableCombinedBalanceView"]),
    pendingBalance: function () {
      return -this.historyTokens
        .filter((t) => t.status == "pending")
        .filter((t) => t.unit == this.activeUnit)
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    balancesOptions: function () {
      const mint = this.activeMint();
      return Object.entries(mint.allBalances).map(([key, value]) => ({
        label: key,
        value: key,
      }));
    },
    allMintKeysets: function () {
      return [].concat(...this.mints.map((m) => m.keysets));
    },
    getTotalBalance: function () {
      return this.totalUnitBalance;
    },
    getActiveBalance: function () {
      return this.activeBalance;
    },
    activeMintLabel: function () {
      const mintClass = this.activeMint();

      return mintClass.mint.nickname || getShortUrl(this.activeMintUrl);
    },
    getBalance: function () {
      var balance = this.activeProofs
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
      return balance;
    },
    getCombinedTotalBalancesOfAllMintsByCurrency: function () {
      return this.computeCombinedTotalBalancesOfAllMints();
    },
    bitcreditTotalBalances: function () {
      const balances = this.computeCombinedTotalBalancesOfAllMints();
      const debitSatBalance = balances["sat"] || 0;
      const creditSatBalance = balances["crsat"] || 0;
      return {
        total: debitSatBalance + creditSatBalance,
        sat: debitSatBalance,
        crsat: creditSatBalance,
      };
    },
    combinedBalanceOptionsOfAllMints: function () {
      return Object.entries(
        this.getCombinedTotalBalancesOfAllMintsByCurrency
      ).map(([key, _]) => ({
        label: key,
        value: key,
      }));
    },
  },
  data() {
    return {
      priceLabel: null,
    };
  },
  mounted() {
    this.fetchBitcoinPriceUSD();
  },
  methods: {
    ...mapActions(useWalletStore, ["checkPendingTokens"]),
    ...mapActions(usePriceStore, ["fetchBitcoinPriceUSD"]),
    toggleUnit: function () {
      const units = this.activeMint().units;
      this.activeUnit =
        units[(units.indexOf(this.activeUnit) + 1) % units.length];
      return this.activeUnit;
    },
    toggleHideBalance() {
      this.hideBalance = !this.hideBalance;
    },
    computeCombinedTotalBalancesOfAllMints: function () {
      const mints = this.mints.map((it) => new MintClass(it));
      const combinedBalancesOfAllMints = mints
        .map((it) => it.allBalances)
        .reduce((acc, balanceObj) => {
          Object.entries(balanceObj).forEach(([key, val]) => {
            acc[key] = acc[key] === undefined ? val : acc[key] + val;
          });

          return acc;
        }, {});

      return combinedBalancesOfAllMints;
    },
  },
});
</script>
<style scoped>
.animated.pulse {
  animation-duration: 0.5s;
}
.animated.fadeInDown {
  animation-duration: 0.3s;
}
</style>
