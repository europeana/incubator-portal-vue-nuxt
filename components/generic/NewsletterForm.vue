<template>
  <figure>
    <figcaption class="text-uppercase font-weight-bold">
      {{ $t('footer.newsletter') }}
    </figcaption>
    <!-- eslint-disable -->
    <!-- Begin Mailchimp Signup Form -->
    <link href="//cdn-images.mailchimp.com/embedcode/classic-10_7.css" rel="stylesheet" type="text/css">
    <style type="text/css">
      #mc-embedded-subscribe-form input[type=checkbox]{display: inline; width: auto;margin-right: 10px;}
      #mergeRow-gdpr {margin-top: 20px;}
      #mergeRow-gdpr fieldset label {font-weight: normal;}
      #mc-embedded-subscribe-form .mc_fieldset{border:none;min-height: 0px;padding-bottom:0px;}
    </style>
    <div id="mc_embed_signup">
    <form action="https://europeana.us3.list-manage.com/subscribe/post?u=ad318b7566f97eccc895e014e&amp;id=1d4f51a117" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
        <div id="mc_embed_signup_scroll">
      <h2>Subscribe</h2>
    <div class="indicates-required"><span class="asterisk">*</span> indicates required</div>
    <div class="mc-field-group">
      <label for="mce-EMAIL">Email Address  <span class="asterisk">*</span>
    </label>
      <input type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL">
    </div>
    <div class="mc-field-group input-group">
        <strong>Which newsletter would you like to receive?  <span class="asterisk">*</span>
    </strong>
        <ul><li><input type="radio" value="English" name="LANGUAGE" id="mce-LANGUAGE-0"><label for="mce-LANGUAGE-0">English</label></li>
    <li><input type="radio" value="French" name="LANGUAGE" id="mce-LANGUAGE-1"><label for="mce-LANGUAGE-1">French</label></li>
    </ul>
    </div>
    <div id="mergeRow-gdpr" class="mergeRow gdpr-mergeRow content__gdprBlock mc-field-group">
        <div class="content__gdpr">
            <label>Marketing Permissions</label>
            <p>Europeana will use the information you provide on this form to be in touch with you and to provide updates and marketing. Please let us know all the ways you would like to hear from us:</p>
            <fieldset class="mc_fieldset gdprRequired mc-field-group" name="interestgroup_field">
        <label class="checkbox subfield" for="gdpr_91"><input type="checkbox" id="gdpr_91" name="gdpr[91]" value="Y" class="av-checkbox "><span>I'd like to receive email updates from Europeana</span> </label>
            </fieldset>
            <p>You can change your mind at any time by clicking the unsubscribe link in the footer of any email you receive from us, or by contacting us at enews@europeana.eu. We will treat your information with respect. For more information about our privacy practices please visit our website. By clicking below, you agree that we may process your information in accordance with these terms.</p>
        </div>
        <div class="content__gdprLegal">
            <p>We use Mailchimp as our marketing platform. By clicking below to subscribe, you acknowledge that your information will be transferred to Mailchimp for processing. <a href="https://mailchimp.com/legal/" target="_blank">Learn more about Mailchimp's privacy practices here.</a></p>
        </div>
    </div>
      <div id="mce-responses" class="clear">
        <div class="response" id="mce-error-response" style="display:none"></div>
        <div class="response" id="mce-success-response" style="display:none"></div>
      </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
        <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_ad318b7566f97eccc895e014e_1d4f51a117" tabindex="-1" value=""></div>
        <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
        </div>
    </form>
    </div>
    <script type='text/javascript' src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'></script><script type='text/javascript'>(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='LANGUAGE';ftypes[1]='radio';}(jQuery));var $mcj = jQuery.noConflict(true);</script>
    <!--End mc_embed_signup-->
    <!-- eslint-disable -->
  </figure>
</template>

<script>
  export default {
    name: 'NewsletterForm'
  };
</script>
