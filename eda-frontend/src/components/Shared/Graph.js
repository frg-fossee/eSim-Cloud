/* eslint-disable react/prop-types */
import React, { Component } from 'react'
import Chart from 'chart.js'
let lineGraph

// Chart Style Options
Chart.defaults.global.defaultFontColor = '#e6e6e6'

class Graph extends Component {
  chartRef = React.createRef();

  componentDidMount () {
    this.buildChart()
  }

  componentDidUpdate () {
    this.buildChart()
  }

  buildChart = () => {
    const myChartRef = this.chartRef.current.getContext('2d')
    const { x, y, labels } = this.props

    if (typeof lineGraph !== 'undefined') lineGraph.destroy()

    const getRandomColor = () => {
      return '#' + (Math.random() * 0xFFFFFF << 0).toString(16)
    }

    const dataset = () => {
      var arr = []
      for (var i = 0; i < y.length; i++) {
        if (labels[i + 1] === labels[0]) continue
        arr.push({
          label: labels[i + 1],
          data: y[i],
          fill: false,
          borderColor: getRandomColor()
        })
      }
      return arr
    }

    lineGraph = new Chart(myChartRef, {
      type: 'line',
      data: {

        labels: x,
        datasets: dataset()
      },

      options: {
        responsive: true,
        title: {
          display: false,
          text: ''
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#39604d'
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [
            {
              display: true,
              gridLines: {
                color: '#67737e'
              },
              scaleLabel: {
                display: true,
                labelString: labels[0]
              },
              ticks: {
                display: true
              }
            }
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: 'Volatge ( V )'
              },
              gridLines: {
                color: '#67737e'
              },
              ticks: {
                beginAtZero: true,
                fontSize: 15,
                // maxTicksLimit: 10, //Set Y axes points
                padding: 25
              }
            }
          ]
        }
      }
    })
  };

  render () {
    return (
      <div>
        <canvas id="myChart" ref={this.chartRef} />
      </div>
    )
  }
}

export default Graph
