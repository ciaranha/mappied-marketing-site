import PropTypes from 'prop-types'
import React, {Component} from 'react'
import NextSeo from 'next-seo'
import groq from 'groq'
import imageUrlBuilder from '@sanity/image-url'
import Layout from '../components/Layout'
import client from '../client'
import RenderSections from '../components/RenderSections'
import styles from './LandingPage.module.css'

function urlFor (source) {
  return imageUrlBuilder(client).image(source)
}

const builder = imageUrlBuilder(client)
const pageQuery = groq`
*[_type == "route" && slug.current == $slug][0]{
  page-> {
    ...,
    content[] {
      ...,
      cta {
        ...,
        route->
      },
      ctas[] {
        ...,
        route->
      }
    }
  }
}
`

class LandingPage extends Component {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    // TODO: improve types
    disallowRobots: PropTypes.any,
    openGraphImage: PropTypes.any,
    content: PropTypes.any,
    features: PropTypes.any,
    customers: PropTypes.any,
    plans: PropTypes.any,
    featureTitle: PropTypes.string,
    config: PropTypes.any,
    slug: PropTypes.any
  }

  static async getInitialProps ({query}) {
    const {slug} = query
    if (!query) {
      console.error('no query')
      return
    }
    if (slug && slug !== '/') {
      return client.fetch(pageQuery, {slug}).then(res => ({...res.page, slug}))
    }

    // Frontpage
    if (slug && slug === '/') {
      return client
        .fetch(
          groq`
        *[_id == "global-config"][0]{
          frontpage -> {...,content[] {...,},
          features[]->,
          customers[]->,
          plans[]->
        }
      }
      `
        )
        .then(res => ({...res.frontpage, slug}))
    }

    return null
  }

  render () {
    const {
      title = 'Missing title',
      description,
      disallowRobots,
      openGraphImage,
      featureTitle = [],
      content = [],
      features = [],
      customers = [],
      plans = [],
      config = {},
      slug
    } = this.props
    console.log(customers)
    const openGraphImages = openGraphImage
      ? [
        {
          url: builder
            .image(openGraphImage)
            .width(800)
            .height(600)
            .url(),
          width: 800,
          height: 600,
          alt: title
        },
        {
          // Facebook recommended size
          url: builder
            .image(openGraphImage)
            .width(1200)
            .height(630)
            .url(),
          width: 1200,
          height: 630,
          alt: title
        },
        {
          // Square 1:1
          url: builder
            .image(openGraphImage)
            .width(600)
            .height(600)
            .url(),
          width: 600,
          height: 600,
          alt: title
        }
      ]
      : []

    return (
      <Layout config={config}>
        <NextSeo
          config={{
            title,
            titleTemplate: `${config.title} | %s`,
            description,
            canonical: config.url && `${config.url}/${slug}`,
            openGraph: {
              images: openGraphImages
            },
            noindex: disallowRobots
          }}
        />
        {content && <RenderSections sections={content} />}
        <div className={styles.container}>
          <div className={styles.root}>
            <h2>{featureTitle}</h2>
          </div>
        </div>
        {features && (
          <div className={styles.container}>
            <div className={styles.features}>
              {features.map(feature =>
                <div key={feature} className={styles.feature}>
                  {feature.icon && (
                    <div>
                      <img
                        src={urlFor(feature.icon)
                          .width(50)
                          .url()}
                      />
                    </div>
                  )}
                  <div className={styles.featureText}>
                    <h3>{feature.title}{feature.key}</h3>
                    <p>{feature.body}</p>
                  </div>
                </div>
              )
              }
            </div>
          </div>
        )}
        {customers && (
          <div className={styles.bg}>
            <div className={styles.container}>
              <div className={styles.customers}>
                {customers.map(customer =>
                  <div key={customer} className={styles.customer}>
                    {customer.image && (
                      <div className={styles.mapImageContainer}>
                        <img
                          src={urlFor(customer.image)
                            .height(152)
                            .url()}
                        />
                      </div>
                    )}
                    <div className={styles.mapDetails}>
                      <h5>{customer.mapTitle}{customer.key}</h5>
                      <p>{customer.customer}</p>
                    </div>
                  </div>
                )
                }
              </div>
            </div>
          </div>
        )}
        {plans && (
          <div className={styles.container}>
            <div className={styles.plans}>
              {plans.map(plan =>
                <div key={plan} className={styles.container}>
                  <div><h5>{plan.name}</h5></div>
                  <div><h2>{plan.priceAnnually}</h2></div>
                  <div className={styles.planIncluded}>
                    <p>{plan.included}</p>
                  </div>
                </div>
              )
              }
            </div>
          </div>
        )}
      </Layout>
    )
  }
}

export default LandingPage
