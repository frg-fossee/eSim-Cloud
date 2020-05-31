/* eslint-disable react/prop-types */
import React from 'react'

import { Line } from 'react-chartjs-2'

const Graph = (props) => {
  const { x, y, labels } = props
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

  return (
    <div>

      <Line
        data={{
          labels: x,
          datasets: dataset()
        }}
        options={{

          responsive: true,
          title: {
            display: false,
            text: ''
          },
          plugins: {
            zoom: {
              // Container for pan options
              pan: {
                // Boolean to enable panning
                enabled: true,

                // Panning directions. Remove the appropriate direction to disable
                // Eg. 'y' would only allow panning in the y direction
                mode: 'xy'
              },

              // Container for zoom options
              zoom: {
                // Boolean to enable zooming
                enabled: true,

                // Zooming directions. Remove the appropriate direction to disable
                // Eg. 'y' would only allow zooming in the y direction
                mode: 'xy'
              }
            }
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

        }}
      />
    </div>
  )
}

export default Graph
