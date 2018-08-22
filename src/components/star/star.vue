<template>
    <div class="star" :class="starType">
        <span v-for="(itemClass,index) in itemClasses" :class="itemClass" class="star-item" :key="index"></span>
    </div>
</template>

<script type="text/ecmascript-6">
// 通过分数展示什么样的星星 根据尺寸展示什么类型（大小）的星星
    const LENGTH = 5;
    const CLS_ON = 'on';
    const CLS_HALF = 'half';
    const CLS_OFF = 'off';

    export default {
        props: {
            size: {
                type: Number
            },
            score: {
                type: Number
            }
        },
        computed: {
            starType() {
                return 'star-' + this.size;
            },
            itemClasses() {
                let result = [];
                // 向下取0.5倍数的值
                let score = Math.floor(this.score * 2) / 2;
                // 判断有没有小数如果不为0那么返回true
                let hasDecimal = score % 1 !== 0;
                // 判断有几个全星
                let integer = Math.floor(score);

                for (let i = 0; i < integer; i++) {
                    result.push(CLS_ON);
                }
                // 判断有没有半星 如果小数部分不为0那么放一个半星（半星最多只有一个）
                if (hasDecimal) {
                    result.push(CLS_HALF);
                }
                while (result.length < LENGTH) {
                    result.push(CLS_OFF);
                }
                return result;
            }
        }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin"

    .star
        // 清除 span直接的间距
        font-size: 0
        .star-item
            display: inline-block
            background-repeat: no-repeat
        &.star-48
            .star-item
                width: 20px
                height: 20px
                margin-right: 22px
                background-size: 20px 20px
                &:last-child
                    margin-right: 0
                &.on
                    bg-image('star48_on')
                &.half
                    bg-image('star48_half')
                &.off
                    bg-image('star48_off')
        &.star-36
            .star-item
                width: 15px
                height: 15px
                margin-right: 6px
                background-size: 15px 15px
                &:last-child
                    margin-right: 0
                &.on
                    bg-image('star36_on')
                &.half
                    bg-image('star36_half')
                &.off
                    bg-image('star36_off')
        &.star-24
            .star-item
                width: 10px
                height: 10px
                margin-right: 3px
                background-size: 10px 10px
                &:last-child
                    margin-right: 0
                &.on
                    bg-image('star24_on')
                &.half
                    bg-image('star24_half')
                &.off
                    bg-image('star24_off')
</style>
