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
    const { x, y1, y2 } = this.props

    if (typeof lineGraph !== 'undefined') lineGraph.destroy()

    lineGraph = new Chart(myChartRef, {
      type: 'line',
      data: {
        labels: x,
        datasets: [
          {
            label: 'V (IN)',
            data: y1,
            fill: false,
            borderColor: '#9feaf9'
          },
          {
            label: 'V (OP)',
            data: y2,
            fill: false,
            borderColor: '#556cd6'
          }
        ]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Voltage vs Time Graph'
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
                labelString: 'Time ( sec )'
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
                display: true,
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
