<template>
  <div class="goods">
    <!-- 左侧菜单导航 -->
    <div class="menu-wrapper" ref="menuWrapper">
      <ul>
        <li v-for="(item,index) in goods" :key="index" class="menu-item" :class="{'current':currentIndex===index}" @click="selectMenu(index,$event)" ref="menuList">
          <span class="text border-1px">
            <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{ item.name }}
          </span>
        </li>
      </ul>
    </div>
    <div class="foods-wrapper" ref="foodsWrapper">
      <ul>
        <li v-for="(item,index) in goods" :key="index" class="food-list" ref="foodList">
          <h1 class="title">{{ item.name }}</h1>
          <ul>
            <li @click="selectFood(food,$event)" v-for="(food,index) in item.foods" :key="index" class="food-item border-1px">
              <div class="icon">
                <img :src="food.icon" width="57" height="57">
              </div>
              <div class="content">
                <h2 class="name">{{ food.name }}</h2>
                <p class="desc">{{ food.description }}</p>
                <div class="extra">
                  <span class="count">月售{{ food.sellCount }}</span><span>好评率{{ food.rating }}%</span>
                </div>
                <div class="price">
                  <span class="now">￥{{ food.price }}</span><span class="old" v-show="food.oldPrice">￥{{ food.oldPrice }}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <!-- 子组件的点击事件派发给了父组件 的addFood函数 -->
                  <cartcontrol @add="addFood" :food="food"></cartcontrol>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <shopcart ref="shopcart" :select-foods="selectFoods" :deliveryPrice="seller.deliveryPrice" :minPrice="seller.minPrice"></shopcart>
    <food @add="addFood" :food="selectedFood" ref="food"></food>
  </div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import shopcart from 'components/shopcart/shopcart';
    import cartcontrol from 'components/cartcontrol/cartcontrol';
    import food from 'components/food/food';

    const ERR_OK = 0;
    const debug = process.env.NODE_ENV !== 'production';

    export default {
      props: {
        seller: {
          type: Object
        }
      },
      data() {
        return {
          goods: [],
          listHeight: [],
          // 存储每次scroll的位置
          scrollY: 0,
          // 用于传递给商品详情页组件 food的数据
          selectedFood: {}
        };
      },
      created() {
        this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];

        const url = debug ? '/api/goods' : 'http://ustbhuangyi.com/sell/api/goods';
        this.$http.get(url).then((response) => {
          response = response.body;
          if (response.errno === ERR_OK) {
            this.goods = response.data;
            // dom发生真的变化在nextTick函数回调之后，所以在操作原生dom时要在nexttick中操作
            this.$nextTick(() => {
              this._initScroll();
              this._calculateHeight();
            });
          }
        });
      },
      computed: {
        // 左侧当前索引应该在哪 (获取这个索引)
        currentIndex() {
          for (let i = 0; i < this.listHeight.length; i++) {
            let height1 = this.listHeight[i];
            let height2 = this.listHeight[i + 1];
            // 如果是最后一个  或者 在当前 滚动的区间
            if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
              this._followScroll(i);
              return i;
            }
          }
          return 0;
        },
        // 使shopcart组件 与父组件实现联动通过 通过判断food有没有count属性
        selectFoods() {
          let foods = [];
          this.goods.forEach((good) => {
            good.foods.forEach((food) => {
              if (food.count) {
                foods.push(food);
              }
            });
          });
          return foods;
        }
      },
      methods: {
        // 使用betterscroll pc端避免点击一次触发两次事件 要传一个$event 在函数中阻止betterscroll的event事件 -->
        selectMenu(index, event) {
          if (!event._constructed) {
            return;
          }
          let foodList = this.$refs.foodList;
          let el = foodList[index];
          // better scroll 的接口 滑动到指定位置
          this.foodsScroll.scrollToElement(el, 300);
        },
        // 小球动画 （target就是子组件传递给父组件的 +  的dom）
        addFood(target) {
          // console.log(target);
          this._drop(target);
        },
        // 点击食物列表 展示food组件（商品详情页） 并将 数据selectedFood 传递给组件food
        selectFood (food, event) {
          if (!event._constructed) {
            return;
          }
          this.selectedFood = food;
          // 调用组件的show方法显示出food详情层
          this.$refs.food.show();
        },
        _drop(target) {
          // 体验优化,异步执行下落动画
          this.$nextTick(() => {
            // 通过vue 的 $ref 将从cartcontrol组件传来的dom 调用另一个子组件shopcart的drop方法
            this.$refs.shopcart.drop(target);
          });
        },
        _initScroll() {
          this.meunScroll = new BScroll(this.$refs.menuWrapper, {
            // 移动端允许默认的点击事件
            click: true
          });

          this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
            click: true,
            // scroll在滚动的时候能实时知道滚动的位置
            probeType: 3
          });

          this.foodsScroll.on('scroll', (pos) => {
            // 判断滑动方向，避免下拉时分类高亮错误（如第一分类商品数量为1时，下拉使得第二分类高亮）
            if (pos.y <= 0) {
              this.scrollY = Math.abs(Math.floor(pos.y)) + 1;
            }
          });
        },
        // 拿到foodlist的高度 用于计算scroll的滚动区间
        _calculateHeight() {
          let foodList = this.$refs.foodList;
          let height = 0;
          this.listHeight.push(height);
          for (let i = 0; i < foodList.length; i++) {
            let item = foodList[i];
            height += item.clientHeight;
            this.listHeight.push(height);
          }
        },
        _followScroll(index) {
          let menuList = this.$refs.menuList;
          let el = menuList[index];
          this.meunScroll.scrollToElement(el, 300, 0, -100);
        }
      },
      components: {
        shopcart,
        cartcontrol,
        food
      }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"

  .goods
    display: flex
    position: absolute
    top: 174px
    bottom: 46px
    width: 100%
    overflow: hidden
    .menu-wrapper
      flex: 0 0 80px
      width: 80px
      background: #f3f5f7
      .menu-item
        display: table
        height: 54px
        width: 56px
        padding: 0 12px
        line-height: 14px
        &.current
          position: relative
          z-index: 10
          margin-top: -1px
          background: #ffffff
          .text
            border-none()
            font-weight: 700
        .icon
          display inline-block
          width: 12px
          height: 12px
          vertical-align: top
          margin-right: 2px
          background-size: 12px
          background-repeat: no-repeat
          &.decrease
              bg-image('decrease_3')
          &.discount
              bg-image('discount_3')
          &.guarantee
              bg-image('guarantee_3')
          &.invoice
              bg-image('invoice_3')
          &.special
              bg-image('special_3')
        .text
          display: table-cell
          width: 56px
          vertical-align: middle
          border-1px(rgba(7, 17, 27, 0.1))
          font-size: 12px
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147, 153, 159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        border-1px(rgba(7, 17, 27, 0.1))
        &:last-child
          border-none()
          margin-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px
            font-size: 14px
            color: rgb(7, 17, 27)
          .desc, .extra
            line-height: 10px
            font-size: 10px
            color: rgb(147, 153, 159)
          .desc
            line-height: 12px
            margin-bottom: 8px
          .extra
            .count
              margin-right: 12px
          .price
            font-weight: 700
            line-height: 24px
            .now
              margin-right: 18px
              font-size: 14px
              color: rgb(240, 20, 20)
            .old
              text-decoration: line-through
              font-size: 10px
              color: rgb(147, 153, 159)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 12px
</style>
