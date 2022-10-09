// import fetch from "node-fetch";
// import fs from "fs";
// import * as cheerio from 'cheerio';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');

const getUser = async (username) => {
  
let url = `https://www.fiverr.com/${username.split(' ')[0]}`;

let response = await fetch(url);
let html = await response.text();

// console.log('ststus: ', response.status)

if(response.status != 200){
  switch(response.status){
    case 404:
      return {
        error: `User doesn't exist`,
        error_code: response.status
      }
      break;
    default:
      return {
        error: `Couldn't find user`,
        error_code: response.status
      }
      break;
  }
}

let $ = cheerio.load(html);

// let username = url.split('/')[url.split('/').length - 1];
let oneliner = $('.oneliner').text();
let ratings = $('.rating-num').text();
let ratingsCount = $('.rating-count').text().match(/\d+/) ? $('.rating-count').text().match(/\d+/)[0] : null;
let location = $('.location b').text();
let memberSience = $('.member-since b').text();
let avgResponceTime = $('.response-time b').text();
let lastDelivery = $('.recent-delivery strong').text();
let description = $('.description p').text();
let languages = [];
$('.languages ul li').each((i, el) => {
    let langText = $(el).text();
    languages.push({
        name: langText.split('-')[0].trim(),
        level: langText.split('-')[1].trim()
    });
});

let linkedAccounts = [];
$('.linked-accounts ul li .text').each((i, el) => {
    linkedAccounts.push($(el).text());
});

let skills = [];
$('.skills ul li a').each((i, el) => {
    skills.push({
        name: $(el).text(),
        url: $(el).attr('href')
    });
});

let certifications = [];
let spl = $('.seller-profile .list')[0]?.children.find(el => el.name == "ul") 

spl?.children && spl.children.forEach(el => {
    if (el.name == 'li') {
        let name = el?.children[0]?.children?.map(el => el.data)?.join('');
        let from = el?.children[1]?.children?.map(el => el.data)?.join('');
        certifications.push({
            name,
            from
        });
    }
});

let gigs = [];
$('.gig-wrapper').each((i, el) => {
    let gigPriceCur = [...$(el).find('footer a span').text()][0];
    let gig = {
        title: $(el).find('h3').text(),
        url: 'https://www.fiverr.com' + $(el).find('a')[0]?.attribs?.href,
        image: $(el).find('a img')[0]?.attribs?.src,
        price: {
            currency: gigPriceCur == '$' ? 'USD' : gigPriceCur,
            amount: $(el).find('footer a span').text().replace(/[^0-9.]/g, ""),
        },
        ratings: {
            count: $(el).find('.content-info .rating-wrapper').text(),
            stars: $(el).find('.content-info .rating-wrapper').text(),
        },
        seller: {
            level: $(el).find('.seller-identifiers .level')?.text()?.match(/\d+/),
            name: $(el).find('.seller-identifiers .seller-name-and-country .seller-name').text(),
        }
    };

    gigs.push(gig);
});

let courses = [];
$('.fiverr-learn .course-list li').each((i, el) => {
    let course = {
        name: $(el).find('.course-tooltip').text(),
        date: $(el).find('small').text()
    }
    courses.push(course)
})

let sellerReviewCategories = [];
let sellerReviews = [], buyerReviews = [];
$('.reviews-header .summary .header-stars li').each((i, el) => {
    sellerReviewCategories.push({
        name: $(el).text().replace(/\d/g, '').trim(),
        score: $(el).find('.rating-score').text(),
    })
})


//edit
$('.reviews-package .review-list').each((ind, e) => {
    e.children.forEach((el, i) => {
        let reviewHeader = $(el).find('.review-item .review-header-container');
        let reviewDetails = $(el).find('.review-item .review-details');

        let review = {
            description: reviewDetails.find('.review-description')?.text(),
            rating: reviewDetails.find('.rating-score')?.text(),
            date: reviewDetails.find('time')?.text(),
            buyer: {
                name: reviewHeader.find('.username')?.text(),
                avatar: reviewHeader.find('.user-profile-image .profile-pict img')?.attr()?.src,
                ...(ind == 0) && {country: {
                    name: reviewHeader.find('.country-name')?.text(),
                    flag: reviewHeader.find('.country-flag')?.attr()?.src
                }}
            }
        }

        if(ind == 0) sellerReviews.push(review);
        else if(ind == 1) buyerReviews.push(review);
        else console.log("something is wrong")
        // }
    })
})


let userReviews = {
    as_seller: {
        score: $('.reviews-header .details .rating-score')[0]?.children[0]?.data,//?.text(),//?.match(/\d+/)[0],
        count: $('.reviews-header .details .ratings-count')[0]?.children?.map(c => c.data)?.join('')?.match(/\d+/)[0],
        categories: sellerReviewCategories,
        reviews: sellerReviews
    },
    as_buyer: {
        reviews: buyerReviews
    }
};


// console.log({username, oneliner, ratings, ratingsCount, location, memberSience, avgResponceTime, lastDelivery, description, languages, linkedAccounts, skills, certifications, gigs, userReviews, courses});
return {username, oneliner, ratings, ratingsCount, location, memberSience, avgResponceTime, lastDelivery, description, languages, linkedAccounts, skills, certifications, gigs, userReviews, courses};
}

// getUser('decodeprasant is goood').then(res => console.log(res/*res.json()*/))//.then(data => console.log(data)).catch(err => console.error(err)

module.exports = {getUser}